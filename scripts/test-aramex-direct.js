const https = require('https');

const credentials = {
  UserName: 'bitoutawalid@gmail.com',
  Password: 'Walid@bitouta@0000',
  Version: '1.0',
  AccountNumber: '60506486',
  AccountPin: '321321',
  AccountEntity: 'TUN',
  AccountCountryCode: 'TN',
  Source: 24,
};

const payload = JSON.stringify({
  ClientInfo: credentials,
  Transaction: { Reference1: 'TEST-PRICE-BREAKDOWN', Reference2: '', Reference3: '', Reference4: '', Reference5: '' },
  Shipments: [
    {
      Reference1: 'CMD-7KRYM1',
      Reference2: 'Prod: 95 DT | Livr: 10 DT',
      Reference3: 'Tel: 21145988',
      Shipper: {
        Reference1: 'ParaTunisie',
        Reference2: '',
        AccountNumber: credentials.AccountNumber,
        PartyAddress: { Line1: 'Rue Ribat', Line2: '', Line3: '', City: 'Sousse', StateOrProvinceCode: '', PostCode: '', CountryCode: 'TN' },
        Contact: { Department: '', PersonName: '.', Title: '', CompanyName: 'Para Tunisie', PhoneNumber1: '0021671160800', PhoneNumber1Ext: '', PhoneNumber2: '', PhoneNumber2Ext: '', FaxNumber: '', CellPhone: '0021671160800', EmailAddress: 'contact@paratunisie.com', Type: '' },
      },
      Consignee: {
        Reference1: '',
        Reference2: '',
        AccountNumber: '',
        PartyAddress: { Line1: '1 Mourouj', Line2: '', Line3: '', City: 'Ben Arous', StateOrProvinceCode: '', PostCode: '', CountryCode: 'TN' },
        Contact: { Department: '', PersonName: '.', Title: '', CompanyName: 'Issam Mekki', PhoneNumber1: '0021621145988', PhoneNumber1Ext: '', PhoneNumber2: '', PhoneNumber2Ext: '', FaxNumber: '', CellPhone: '0021621145988', EmailAddress: 'contact@paratunisie.com', Type: '' },
      },
      ThirdParty: {
        Reference1: '',
        Reference2: '',
        AccountNumber: '',
        PartyAddress: { Line1: '', Line2: '', Line3: '', City: '', StateOrProvinceCode: '', PostCode: '', CountryCode: 'TN' },
        Contact: { Department: '', PersonName: '', Title: '', CompanyName: '', PhoneNumber1: '', PhoneNumber1Ext: '', PhoneNumber2: '', PhoneNumber2Ext: '', FaxNumber: '', CellPhone: '', EmailAddress: '', Type: '' },
      },
      ShippingDateTime: '/Date(' + (Date.now()) + '-0500)/',
      DueDate: '/Date(' + (Date.now()) + '-0500)/',
      Comments: '1x Ashwagandha (95 DT) + Livr. (10 DT) = Total 105 DT',
      PickupLocation: 'Reception',
      OperationsInstructions: 'Prod: 95 DT + Livr: 10 DT = 105 DT',
      AccountingInstrcutions: 'Produit: 95 DT | Livr: 10 DT',
      ForeignHAWB: '',
      TransportType: 0,
      PickupGUID: '',
      Details: {
        Dimensions: null,
        ActualWeight: { Unit: 'KG', Value: 1.0 },
        ChargeableWeight: null,
        DescriptionOfGoods: '1x Ashwagandha (95 DT) + Livr. (10 DT) = 105 DT',
        GoodsOriginCountry: 'TN',
        NumberOfPieces: 1,
        ProductGroup: 'DOM',
        ProductType: 'ONP',
        PaymentType: 'P',
        PaymentOptions: '',
        Services: 'CODS',
        CashOnDeliveryAmount: { CurrencyCode: 'TND', Value: 105 },
        InsuranceAmount: null,
        CashAdditionalAmount: null,
        CashAdditionalAmountDescription: '',
        CustomsValueAmount: { CurrencyCode: 'TND', Value: 105 },
        CollectAmount: null,
        Items: [
          {
            PackageType: 'Box',
            Quantity: 1,
            Weight: { Unit: 'KG', Value: 1.0 },
            Comments: 'Ashwagandha BioTechUSA (95 DT)',
            Reference: 'ITEM-1',
            Pieces: 1,
            CountryOfOrigin: 'TN',
            GoodsDescription: '1x Ashwagandha (95 DT) + Livr: 10 DT',
          },
        ],
      },
      Attachments: [],
    },
  ],
  LabelInfo: { ReportID: 9737, ReportType: 'URL' },
});

const options = {
  hostname: 'ws.aramex.net',
  path: '/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Shipment ID:', json.Shipments?.[0]?.ID);
    console.log('Label URL:', json.Shipments?.[0]?.ShipmentLabel?.LabelURL);
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(payload);
req.end();
