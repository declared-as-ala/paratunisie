import paramiko

VPS_HOST = "145.223.118.9"
VPS_USER = "root"
VPS_PASS = "3)'qklBH#Dtv'xY2"
VPS_PORT = 22

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, port=VPS_PORT, username=VPS_USER, password=VPS_PASS, timeout=30)
sftp = client.open_sftp()

def run(cmd):
    print("=" * 60)
    print(f"RUN: {cmd}")
    print("=" * 60)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    print(out)
    if err:
        print("[STDERR]", err)
    return out

FILAMENT_PATH = "/root/sobitas-project/filament"

# -------------------------------------------------------------
# 1. Update config/services.php
# -------------------------------------------------------------
services_php = """<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'aramex' => [
        'base_url' => env('ARAMEX_BASE_URL', 'https://ws.aramex.net'),
        'user_name' => env('ARAMEX_USER_NAME', 'bitoutawalid@gmail.com'),
        'password' => env('ARAMEX_PASSWORD', 'Walid@bitouta@0000'),
        'account_number' => env('ARAMEX_ACCOUNT_NUMBER', '60506486'),
        'account_pin' => env('ARAMEX_ACCOUNT_PIN', '321321'),
        'account_entity' => env('ARAMEX_ACCOUNT_ENTITY', 'TUN'),
        'account_country_code' => env('ARAMEX_ACCOUNT_COUNTRY_CODE', 'TN'),
        'source' => (int) env('ARAMEX_SOURCE', 24),
        'shipper' => [
            'name' => env('ARAMEX_SHIPPER_NAME', 'Proteine Tunisie'),
            'company' => env('ARAMEX_SHIPPER_NAME', 'Proteine Tunisie'),
            'phone' => env('ARAMEX_SHIPPER_PHONE', '0021671160800'),
            'email' => env('ARAMEX_SHIPPER_EMAIL', 'contact@protein.tn'),
            'address' => env('ARAMEX_SHIPPER_ADDRESS', 'Rue Ribat'),
            'city' => env('ARAMEX_SHIPPER_CITY', 'Sousse'),
            'country' => env('ARAMEX_SHIPPER_COUNTRY', 'TN'),
        ],
    ],

];
"""

with sftp.open(f"{FILAMENT_PATH}/config/services.php", "w") as f:
    f.write(services_php)
print("✓ Updated config/services.php")

# -------------------------------------------------------------
# 2. Append Aramex variables to .env
# -------------------------------------------------------------
aramex_env = """
ARAMEX_BASE_URL="https://ws.aramex.net"
ARAMEX_USER_NAME="bitoutawalid@gmail.com"
ARAMEX_PASSWORD="Walid@bitouta@0000"
ARAMEX_ACCOUNT_NUMBER="60506486"
ARAMEX_ACCOUNT_PIN="321321"
ARAMEX_ACCOUNT_ENTITY="TUN"
ARAMEX_ACCOUNT_COUNTRY_CODE="TN"
ARAMEX_SOURCE=24
ARAMEX_SHIPPER_NAME="Proteine Tunisie"
ARAMEX_SHIPPER_PHONE="0021671160800"
ARAMEX_SHIPPER_EMAIL="contact@protein.tn"
ARAMEX_SHIPPER_ADDRESS="Rue Ribat"
ARAMEX_SHIPPER_CITY="Sousse"
ARAMEX_SHIPPER_COUNTRY="TN"
"""
run(f'grep -q "ARAMEX_ACCOUNT_NUMBER" {FILAMENT_PATH}/.env || echo \'{aramex_env}\' >> {FILAMENT_PATH}/.env')
print("✓ .env configured with Aramex credentials")

# -------------------------------------------------------------
# 3. Create Migration for Aramex Columns
# -------------------------------------------------------------
migration_code = """<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            if (!Schema::hasColumn('commandes', 'aramex_hawb')) {
                $table->string('aramex_hawb')->nullable()->index()->after('etat');
            }
            if (!Schema::hasColumn('commandes', 'aramex_label_url')) {
                $table->text('aramex_label_url')->nullable()->after('aramex_hawb');
            }
            if (!Schema::hasColumn('commandes', 'aramex_status')) {
                $table->string('aramex_status')->nullable()->after('aramex_label_url');
            }
            if (!Schema::hasColumn('commandes', 'aramex_last_tracking_update')) {
                $table->timestamp('aramex_last_tracking_update')->nullable()->after('aramex_status');
            }
            if (!Schema::hasColumn('commandes', 'aramex_pickup_guid')) {
                $table->string('aramex_pickup_guid')->nullable()->after('aramex_last_tracking_update');
            }
            if (!Schema::hasColumn('commandes', 'aramex_raw_response')) {
                $table->json('aramex_raw_response')->nullable()->after('aramex_pickup_guid');
            }
        });
    }

    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $columns = [
                'aramex_hawb',
                'aramex_label_url',
                'aramex_status',
                'aramex_last_tracking_update',
                'aramex_pickup_guid',
                'aramex_raw_response',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('commandes', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
"""

migration_filename = f"{FILAMENT_PATH}/database/migrations/2026_08_30_000001_add_aramex_columns_to_commandes_table.php"
with sftp.open(migration_filename, "w") as f:
    f.write(migration_code)
print("✓ Migration file created.")

# Run migration
run("docker exec sobitas-backend-v2 php artisan migrate --force")

# -------------------------------------------------------------
# 4. Create App\Services\AramexService
# -------------------------------------------------------------
aramex_service_code = """<?php

namespace App\\Services;

use App\\Models\\Commande;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Log;

class AramexService
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('services.aramex', []);
    }

    protected function getClientInfo(): array
    {
        return [
            'UserName'           => $this->config['user_name'] ?? 'bitoutawalid@gmail.com',
            'Password'           => $this->config['password'] ?? 'Walid@bitouta@0000',
            'Version'            => '1.0',
            'AccountNumber'      => $this->config['account_number'] ?? '60506486',
            'AccountPin'         => $this->config['account_pin'] ?? '321321',
            'AccountEntity'      => $this->config['account_entity'] ?? 'TUN',
            'AccountCountryCode' => $this->config['account_country_code'] ?? 'TN',
            'Source'             => $this->config['source'] ?? 24,
        ];
    }

    /**
     * Create an Aramex Shipment for a given order
     */
    public function createShipment(Commande $commande, array $customData = []): array
    {
        $endpoint = rtrim($this->config['base_url'] ?? 'https://ws.aramex.net', '/') . '/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments';

        $clientInfo = $this->getClientInfo();
        $shipperCfg = $this->config['shipper'] ?? [];

        // Determine destination contact & address
        $consigneeName = trim($customData['nom'] ?? ($commande->livraison_nom ? "{$commande->livraison_prenom} {$commande->livraison_nom}" : "{$commande->prenom} {$commande->nom}"));
        if (empty($consigneeName)) $consigneeName = 'Client Commande #' . $commande->numero;

        $phone = preg_replace('/[^0-9+]/', '', $customData['phone'] ?? $commande->livraison_phone ?? $commande->phone ?? '20000000');
        if (str_starts_with($phone, '00216')) {
            $formattedPhone = $phone;
        } elseif (str_starts_with($phone, '+216')) {
            $formattedPhone = '00216' . substr($phone, 4);
        } elseif (strlen($phone) === 8) {
            $formattedPhone = '00216' . $phone;
        } else {
            $formattedPhone = $phone;
        }

        $address = $customData['adresse'] ?? $commande->livraison_adresse1 ?? $commande->adresse1 ?? 'Tunisie';
        $city = $customData['ville'] ?? $commande->livraison_ville ?? $commande->ville ?? 'Tunis';
        $region = $customData['region'] ?? $commande->livraison_region ?? $commande->region ?? '';
        $postcode = $customData['code_postale'] ?? $commande->livraison_code_postale ?? $commande->code_postale ?? '';
        $email = $commande->livraison_email ?? $commande->email ?? 'client@protein.tn';

        $weight = (float) ($customData['weight'] ?? 1.0);
        $numberOfPieces = (int) ($customData['number_of_pieces'] ?? 1);
        $codAmount = isset($customData['cod_amount']) ? (float) $customData['cod_amount'] : (float) $commande->prix_ttc;
        $description = $customData['description'] ?? "Commande #{$commande->numero} - Proteine Tunisie";
        $instructions = $customData['instructions'] ?? $commande->note ?? '';

        // Cash On Delivery services
        $services = '';
        $cashOnDelivery = null;
        $isCod = ($customData['is_cod'] ?? true) && $codAmount > 0;
        if ($isCod) {
            $services = 'CODS';
            $cashOnDelivery = [
                'Amount'   => $codAmount,
                'CurrencyCode' => 'TND',
            ];
        }

        $payload = [
            'ClientInfo'  => $clientInfo,
            'Transaction' => [
                'Reference1' => (string) $commande->numero,
                'Reference2' => (string) $commande->id,
                'Reference3' => '',
                'Reference4' => '',
                'Reference5' => '',
            ],
            'Shipments' => [
                [
                    'Reference1' => (string) $commande->numero,
                    'Reference2' => (string) $commande->id,
                    'Reference3' => '',
                    'Shipper' => [
                        'Reference1'    => '',
                        'Reference2'    => '',
                        'AccountNumber' => $clientInfo['AccountNumber'],
                        'PartyAddress'  => [
                            'Line1'               => $shipperCfg['address'] ?? 'Rue Ribat',
                            'Line2'               => '',
                            'Line3'               => '',
                            'City'                => $shipperCfg['city'] ?? 'Sousse',
                            'StateOrProvinceCode' => '',
                            'PostCode'            => '',
                            'CountryCode'         => $shipperCfg['country'] ?? 'TN',
                        ],
                        'Contact' => [
                            'Department'     => '',
                            'PersonName'     => $shipperCfg['name'] ?? 'Proteine Tunisie',
                            'Title'          => '',
                            'CompanyName'    => $shipperCfg['company'] ?? 'Proteine Tunisie',
                            'PhoneNumber1'   => $shipperCfg['phone'] ?? '0021671160800',
                            'PhoneNumber1Ext'=> '',
                            'PhoneNumber2'   => '',
                            'PhoneNumber2Ext'=> '',
                            'FaxNumber'      => '',
                            'CellPhone'      => $shipperCfg['phone'] ?? '0021671160800',
                            'EmailAddress'   => $shipperCfg['email'] ?? 'contact@protein.tn',
                            'Type'           => '',
                        ],
                    ],
                    'Consignee' => [
                        'Reference1'    => '',
                        'Reference2'    => '',
                        'AccountNumber' => '',
                        'PartyAddress'  => [
                            'Line1'               => $address,
                            'Line2'               => $region,
                            'Line3'               => '',
                            'City'                => $city,
                            'StateOrProvinceCode' => $region,
                            'PostCode'            => $postcode,
                            'CountryCode'         => 'TN',
                        ],
                        'Contact' => [
                            'Department'     => '',
                            'PersonName'     => $consigneeName,
                            'Title'          => '',
                            'CompanyName'    => $consigneeName,
                            'PhoneNumber1'   => $formattedPhone,
                            'PhoneNumber1Ext'=> '',
                            'PhoneNumber2'   => '',
                            'PhoneNumber2Ext'=> '',
                            'FaxNumber'      => '',
                            'CellPhone'      => $formattedPhone,
                            'EmailAddress'   => $email,
                            'Type'           => '',
                        ],
                    ],
                    'ThirdParty' => [
                        'Reference1'    => '',
                        'Reference2'    => '',
                        'AccountNumber' => '',
                        'PartyAddress'  => [
                            'Line1'               => '',
                            'Line2'               => '',
                            'Line3'               => '',
                            'City'                => '',
                            'StateOrProvinceCode' => '',
                            'PostCode'            => '',
                            'CountryCode'         => 'TN',
                        ],
                        'Contact' => [
                            'Department'     => '',
                            'PersonName'     => '',
                            'Title'          => '',
                            'CompanyName'    => '',
                            'PhoneNumber1'   => '',
                            'PhoneNumber1Ext'=> '',
                            'PhoneNumber2'   => '',
                            'PhoneNumber2Ext'=> '',
                            'FaxNumber'      => '',
                            'CellPhone'      => '',
                            'EmailAddress'   => '',
                            'Type'           => '',
                        ],
                    ],
                    'ShippingDateTime'       => '/Date(' . (time() * 1000) . '-0500)/',
                    'DueDate'                => '/Date(' . (time() * 1000) . '-0500)/',
                    'Comments'               => $instructions ?: "Commande #{$commande->numero}",
                    'PickupLocation'         => 'Reception',
                    'OperationsInstructions' => $instructions,
                    'AccountingInstrcutions' => '',
                    'ForeignHAWB'            => '',
                    'TransportType'          => 0,
                    'PickupGUID'             => '',
                    'Details' => [
                        'Dimensions'          => null,
                        'ActualWeight'        => ['Unit' => 'KG', 'Value' => $weight],
                        'ChargeableWeight'    => null,
                        'DescriptionOfGoods'  => $description,
                        'GoodsOriginCountry'  => 'TN',
                        'NumberOfPieces'      => $numberOfPieces,
                        'ProductGroup'        => 'DOM',
                        'ProductType'         => 'ONP',
                        'PaymentType'         => 'P',
                        'PaymentOptions'      => '',
                        'Services'            => $services,
                        'CashOnDeliveryAmount'=> $cashOnDelivery,
                        'CashAdditionalAmount'=> null,
                        'CustomsValueAmount'  => null,
                        'Items'               => [],
                    ],
                ],
            ],
            'LabelInfo' => [
                'ReportID'   => 9737, // Standard A4 / thermal sticker label
                'ReportType' => 'URL',
            ],
        ];

        Log::info("[Aramex] CreateShipment Request for Commande #{$commande->numero}", ['payload' => $payload]);

        try {
            $response = Http::timeout(30)
                ->withHeaders(['Content-Type' => 'application/json', 'Accept' => 'application/json'])
                ->post($endpoint, $payload);

            $data = $response->json();
            Log::info("[Aramex] CreateShipment Response for Commande #{$commande->numero}", ['status' => $response->status(), 'data' => $data]);

            if ($response->successful() && !empty($data['HasErrors']) && $data['HasErrors'] === true) {
                $errorMsg = $data['Notifications'][0]['Message'] ?? 'Erreur inconnue de l\\'API Aramex';
                return ['success' => false, 'error' => $errorMsg, 'raw' => $data];
            }

            if ($response->successful() && !empty($data['Shipments'][0]['ID'])) {
                $shipment = $data['Shipments'][0];
                $hawb = $shipment['ID'];
                $labelUrl = $shipment['ShipmentLabel']['LabelURL'] ?? ($data['ShipmentLabel']['LabelURL'] ?? null);

                // Update Commande in Database
                $commande->update([
                    'aramex_hawb'                 => $hawb,
                    'aramex_label_url'            => $labelUrl,
                    'aramex_status'               => 'Created',
                    'aramex_last_tracking_update' => now(),
                    'aramex_raw_response'         => $data,
                    'etat'                        => 'expedie',
                ]);

                return [
                    'success'   => true,
                    'hawb'      => $hawb,
                    'label_url' => $labelUrl,
                    'data'      => $data,
                ];
            }

            $errorMsg = $data['Notifications'][0]['Message'] ?? 'Impossible de générer le bordereau Aramex';
            return ['success' => false, 'error' => $errorMsg, 'raw' => $data];

        } catch (\\Exception $e) {
            Log::error("[Aramex] Exception during CreateShipment", ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return ['success' => false, 'error' => 'Erreur technique : ' . $e->getMessage()];
        }
    }

    /**
     * Track an Aramex Shipment
     */
    public function trackShipment(string $hawb): array
    {
        $endpoint = rtrim($this->config['base_url'] ?? 'https://ws.aramex.net', '/') . '/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments';

        $payload = [
            'ClientInfo'  => $this->getClientInfo(),
            'Transaction' => ['Reference1' => $hawb],
            'Shipments'   => [$hawb],
            'GetLastTrackingUpdateOnly' => false,
        ];

        try {
            $response = Http::timeout(20)->post($endpoint, $payload);
            $data = $response->json();
            Log::info("[Aramex] TrackShipment Response for HAWB {$hawb}", ['data' => $data]);

            if ($response->successful() && !empty($data['TrackingResults'][0]['Value'])) {
                $results = $data['TrackingResults'][0]['Value'];
                $checkpoints = [];

                foreach ($results as $item) {
                    $rawDate = $item['UpdateDateTime'] ?? '';
                    $formattedDate = $rawDate;
                    if (preg_match('/\/Date\((\d+)(?:[+-]\d+)?\)\//', $rawDate, $m)) {
                        $formattedDate = date('Y-m-d H:i', (int) ($m[1] / 1000));
                    }

                    $checkpoints[] = [
                        'date'        => $formattedDate,
                        'location'    => $item['UpdateLocation'] ?? '',
                        'description' => $item['UpdateDescription'] ?? '',
                        'code'        => $item['UpdateCode'] ?? '',
                        'comments'    => $item['Comments'] ?? '',
                    ];
                }

                return [
                    'success'     => true,
                    'hawb'        => $hawb,
                    'checkpoints' => $checkpoints,
                    'raw'         => $data,
                ];
            }

            return ['success' => false, 'error' => 'Aucune étape de suivi trouvée pour ce numéro HAWB'];
        } catch (\\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Print or retrieve Label URL
     */
    public function printLabel(string $hawb): ?string
    {
        $endpoint = rtrim($this->config['base_url'] ?? 'https://ws.aramex.net', '/') . '/ShippingAPI.V2/Shipping/Service_1_0.svc/json/PrintLabel';

        $payload = [
            'ClientInfo'  => $this->getClientInfo(),
            'Transaction' => ['Reference1' => $hawb],
            'ShipmentNumber' => $hawb,
            'LabelInfo' => [
                'ReportID'   => 9737,
                'ReportType' => 'URL',
            ],
        ];

        try {
            $response = Http::timeout(20)->post($endpoint, $payload);
            $data = $response->json();
            return $data['ShipmentLabel']['LabelURL'] ?? null;
        } catch (\\Exception $e) {
            Log::error("[Aramex] PrintLabel Exception", ['error' => $e->getMessage()]);
            return null;
        }
    }
}
"""

run(f"mkdir -p {FILAMENT_PATH}/app/Services")
with sftp.open(f"{FILAMENT_PATH}/app/Services/AramexService.php", "w") as f:
    f.write(aramex_service_code)
print("✓ App\\Services\\AramexService.php created.")

sftp.close()
client.close()
