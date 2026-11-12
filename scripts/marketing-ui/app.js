// ==========================================================================
// PARATUNISIE & PROTEIN.TN — MARKETING HUB FRONTEND CONTROLLER
// Real-time dynamic preview, campaign dispatcher & audience management
// ==========================================================================

let currentChannel = "email"; // "email" | "sms"
let previewViewport = "desktop"; // "desktop" | "mobile"
let contactsCache = [];
let campaignActive = false;
let campaignPaused = false;
let campaignEventSource = null;
let currentCampaignLogs = [];

// DOM References
const tabEmail = document.getElementById("tabEmail");
const tabSms = document.getElementById("tabSms");
const emailFieldsSection = document.getElementById("emailFieldsSection");
const smsFieldsSection = document.getElementById("smsFieldsSection");
const composerTitle = document.getElementById("composerTitle");
const presetsContainer = document.getElementById("presetsContainer");
const mainContentEditor = document.getElementById("mainContentEditor");
const editorContentLabel = document.getElementById("editorContentLabel");
const emailSubject = document.getElementById("emailSubject");
const emailFromName = document.getElementById("emailFromName");
const emailReplyTo = document.getElementById("emailReplyTo");
const smsSenderId = document.getElementById("smsSenderId");
const smsCharCount = document.getElementById("smsCharCount");
const smsSegmentCount = document.getElementById("smsSegmentCount");
const emailPreviewBox = document.getElementById("emailPreviewBox");
const smsPreviewBox = document.getElementById("smsPreviewBox");
const emailPreviewIframe = document.getElementById("emailPreviewIframe");
const mockupSenderId = document.getElementById("mockupSenderId");
const mockupSmsText = document.getElementById("mockupSmsText");
const mockupSmsTime = document.getElementById("mockupSmsTime");
const previewControls = document.getElementById("previewControls");
const audienceFilter = document.getElementById("audienceFilter");
const statTargetSelected = document.getElementById("statTargetSelected");
const btnLaunchCampaign = document.getElementById("btnLaunchCampaign");
const campaignConsole = document.getElementById("campaignConsole");
const progressBarFill = document.getElementById("progressBarFill");
const statProgressPct = document.getElementById("statProgressPct");
const statSentSuccess = document.getElementById("statSentSuccess");
const statSentErrors = document.getElementById("statSentErrors");
const statSentRemaining = document.getElementById("statSentRemaining");
const statSentTotal = document.getElementById("statSentTotal");
const logsTableBody = document.getElementById("logsTableBody");
const btnPauseResume = document.getElementById("btnPauseResume");

// Init on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  setupEditorListeners();
  loadPresets();
  switchChannel("email");
  await fetchSystemStatusAndContacts();
});

// Setup input and real-time preview listeners
function setupEditorListeners() {
  mainContentEditor.addEventListener("input", debounce(updateLivePreview, 150));
  emailSubject.addEventListener("input", debounce(updateLivePreview, 150));
  smsSenderId.addEventListener("input", () => {
    mockupSenderId.textContent = smsSenderId.value.trim() || "SOBITAS";
  });
}

// Channel Switcher
function switchChannel(channel) {
  currentChannel = channel;

  if (channel === "email") {
    tabEmail.className = "channel-btn active channel-email";
    tabSms.className = "channel-btn";
    emailFieldsSection.style.display = "block";
    smsFieldsSection.style.display = "none";
    emailPreviewBox.style.display = "flex";
    smsPreviewBox.style.display = "none";
    previewControls.style.display = "flex";
    composerTitle.innerHTML = '<span>📧</span> Éditeur Email Marketing (HTML & CSS)';
    editorContentLabel.textContent = "Code HTML & CSS de l'Email";
    btnLaunchCampaign.className = "btn btn-primary-email";
    btnLaunchCampaign.innerHTML = '<span id="btnLaunchIcon">🚀</span> Lancer la Campagne Email';
    
    // Load first email preset if editor is empty or was in sms mode
    if (!mainContentEditor.value || mainContentEditor.dataset.channel === "sms") {
      applyPreset("protein-promo");
    }
  } else {
    tabSms.className = "channel-btn active channel-sms";
    tabEmail.className = "channel-btn";
    emailFieldsSection.style.display = "none";
    smsFieldsSection.style.display = "block";
    emailPreviewBox.style.display = "none";
    smsPreviewBox.style.display = "flex";
    previewControls.style.display = "none";
    composerTitle.innerHTML = '<span>💬</span> Éditeur SMS Marketing';
    editorContentLabel.textContent = "Texte du Message SMS";
    btnLaunchCampaign.className = "btn btn-primary-sms";
    btnLaunchCampaign.innerHTML = '<span id="btnLaunchIcon">🚀</span> Lancer la Campagne SMS';

    // Load first sms preset if editor is empty or was in email mode
    if (!mainContentEditor.value || mainContentEditor.dataset.channel === "email") {
      applyPreset("sms-promo-weekend");
    }
  }

  mainContentEditor.dataset.channel = channel;
  loadPresets();
  updateAudienceSelection();
  updateLivePreview();
}

// Load Presets Chips
function loadPresets() {
  presetsContainer.innerHTML = "";
  const list = PRESET_TEMPLATES[currentChannel] || [];

  list.forEach((preset, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "preset-chip" + (index === 0 ? " active" : "");
    chip.textContent = preset.name;
    chip.onclick = () => {
      document.querySelectorAll(".preset-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      applyPreset(preset.id);
    };
    presetsContainer.appendChild(chip);
  });
}

// Apply Selected Preset
function applyPreset(presetId) {
  const list = PRESET_TEMPLATES[currentChannel] || [];
  const preset = list.find(p => p.id === presetId);
  if (!preset) return;

  if (currentChannel === "email") {
    emailSubject.value = preset.subject || "";
    mainContentEditor.value = preset.html || "";
  } else {
    mainContentEditor.value = preset.text || "";
  }

  updateLivePreview();
}

// Variable Placeholders Insertion
function insertVariable(tag) {
  const el = mainContentEditor;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = el.value;
  el.value = text.substring(0, start) + tag + text.substring(end);
  el.focus();
  el.selectionStart = el.selectionEnd = start + tag.length;
  updateLivePreview();
}

// Real-Time Preview
function updateLivePreview() {
  const content = mainContentEditor.value;
  const sampleContact = {
    name: "Wissem Debech",
    phone: "21909597",
    email: "wissemdebech@gmail.com",
    id: "6"
  };

  const rendered = content
    .replace(/\{\{name\}\}/gi, sampleContact.name)
    .replace(/\{\{phone\}\}/gi, sampleContact.phone)
    .replace(/\{\{email\}\}/gi, sampleContact.email)
    .replace(/\{\{id\}\}/gi, sampleContact.id);

  if (currentChannel === "email") {
    emailPreviewIframe.srcdoc = rendered || "<p style='color:#999; font-family:sans-serif;'>Aperçu vide. Entrez du code HTML...</p>";
  } else {
    mockupSmsText.textContent = rendered || "Entrez votre message SMS...";
    mockupSenderId.textContent = smsSenderId.value.trim() || "SOBITAS";
    
    const now = new Date();
    mockupSmsTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} • Reçu`;

    // Calculate GSM chars and segments
    const len = content.length;
    smsCharCount.textContent = len;
    
    // Check if non-GSM (Unicode) chars exist
    const isUnicode = /[^\u0020-\u007E\r\n\t€]/.test(content);
    const limit = isUnicode ? 70 : 160;
    const segments = len === 0 ? 0 : Math.ceil(len / limit);
    smsSegmentCount.textContent = `${segments} SMS (${isUnicode ? 'Unicode 70c' : 'GSM-7 160c'})`;
  }
}

// Viewport Switcher
function setPreviewViewport(mode) {
  previewViewport = mode;
  document.getElementById("btnViewDesktop").classList.toggle("active", mode === "desktop");
  document.getElementById("btnViewMobile").classList.toggle("active", mode === "mobile");
  emailPreviewIframe.classList.toggle("viewport-mobile", mode === "mobile");
}

// Fetch System Status & Database Metrics
async function fetchSystemStatusAndContacts() {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error("Erreur de connexion au serveur");
    const data = await res.json();

    document.getElementById("statTotalContacts").textContent = data.counts.total.toLocaleString();
    document.getElementById("statValidEmails").textContent = data.counts.validEmails.toLocaleString();
    document.getElementById("statValidPhones").textContent = data.counts.validPhones.toLocaleString();
    document.getElementById("totalContactsBadge").textContent = data.counts.total.toLocaleString();

    if (data.config.smtpUser) {
      document.getElementById("smtpUser").textContent = data.config.smtpUser.split("@")[0];
    }
    if (data.config.smsSenderId) {
      document.getElementById("smsSender").textContent = data.config.smsSenderId;
      smsSenderId.value = data.config.smsSenderId;
    }

    contactsCache = data.contactsSample || [];
    updateAudienceSelection();
  } catch (err) {
    showToast("Impossible de charger les métriques: " + err.message, "error");
  }
}

// Update Audience Count Display
async function updateAudienceSelection() {
  const filter = audienceFilter.value;
  try {
    const res = await fetch(`/api/audience-count?channel=${currentChannel}&filter=${filter}`);
    const data = await res.json();
    statTargetSelected.textContent = data.count.toLocaleString();
  } catch {
    // fallback estimates
    if (filter === "test_only") statTargetSelected.textContent = "1";
    else if (currentChannel === "email") statTargetSelected.textContent = "628";
    else statTargetSelected.textContent = "4,735";
  }
}

// ==========================================================================
// TEST SEND MODAL & EXECUTION
// ==========================================================================
function openTestModal() {
  document.getElementById("testModal").classList.add("active");
  const isEmail = currentChannel === "email";
  document.getElementById("testEmailGroup").style.display = isEmail ? "block" : "none";
  document.getElementById("testSmsGroup").style.display = isEmail ? "none" : "block";
}

function closeTestModal() {
  document.getElementById("testModal").classList.remove("active");
}

async function executeTestSend() {
  const btn = document.getElementById("btnExecuteTest");
  btn.disabled = true;
  btn.textContent = "⏳ Envoi du test en cours...";

  const isEmail = currentChannel === "email";
  const recipient = isEmail 
    ? document.getElementById("testEmailRecipient").value.trim()
    : document.getElementById("testPhoneRecipient").value.trim();

  if (!recipient) {
    showToast("Veuillez saisir un destinataire pour le test", "error");
    btn.disabled = false;
    btn.textContent = "🚀 Envoyer le Test";
    return;
  }

  const payload = {
    channel: currentChannel,
    recipient: recipient,
    subject: emailSubject.value,
    content: mainContentEditor.value,
    fromName: emailFromName.value,
    replyTo: emailReplyTo.value,
    senderId: smsSenderId.value.trim() || "SOBITAS"
  };

  try {
    const res = await fetch("/api/test-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      showToast(`✅ Test envoyé avec succès à ${recipient} !`, "success");
      closeTestModal();
    } else {
      showToast(`❌ Échec du test: ${result.error || result.message}`, "error");
    }
  } catch (err) {
    showToast("Erreur réseau: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "🚀 Envoyer le Test";
  }
}

// ==========================================================================
// CAMPAIGN LAUNCH & LIVE CONTROLLER
// ==========================================================================
function confirmAndLaunchCampaign() {
  const count = statTargetSelected.textContent;
  const channelName = currentChannel === "email" ? "Email" : "SMS";
  const confirmed = confirm(
    `Êtes-vous sûr de vouloir lancer cette campagne ${channelName} à destination de ${count} contacts ?\n\nConseil: Envoyez un test d'abord si ce n'est pas déjà fait !`
  );
  if (!confirmed) return;

  startCampaign();
}

async function startCampaign() {
  const throttle = Number(document.getElementById("sendThrottle").value) || 1000;
  const payload = {
    channel: currentChannel,
    filter: audienceFilter.value,
    subject: emailSubject.value,
    content: mainContentEditor.value,
    fromName: emailFromName.value,
    replyTo: emailReplyTo.value,
    senderId: smsSenderId.value.trim() || "SOBITAS",
    throttleMs: throttle
  };

  try {
    const res = await fetch("/api/campaign/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!data.success) {
      showToast("Impossible de démarrer: " + data.error, "error");
      return;
    }

    campaignActive = true;
    campaignPaused = false;
    currentCampaignLogs = [];
    logsTableBody.innerHTML = "";
    campaignConsole.style.display = "block";
    campaignConsole.scrollIntoView({ behavior: "smooth" });

    showToast(`🚀 Campagne ${currentChannel.toUpperCase()} lancée !`, "success");
    connectCampaignStream();
  } catch (err) {
    showToast("Erreur de lancement: " + err.message, "error");
  }
}

// Connect Server-Sent Events for Live Progress
function connectCampaignStream() {
  if (campaignEventSource) campaignEventSource.close();

  campaignEventSource = new EventSource("/api/campaign/stream");

  campaignEventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleCampaignProgressUpdate(data);
    } catch (e) {
      console.error(e);
    }
  };

  campaignEventSource.onerror = () => {
    // If connection drops, poll fallback
    setTimeout(pollCampaignStatus, 2000);
  };
}

function handleCampaignProgressUpdate(data) {
  const { total, sent, failed, remaining, percent, status, latestLog } = data;

  statSentTotal.textContent = total;
  statSentSuccess.textContent = sent;
  statSentErrors.textContent = failed;
  statSentRemaining.textContent = remaining;
  statProgressPct.textContent = percent + "%";
  progressBarFill.style.width = percent + "%";

  document.getElementById("campaignStatusTitle").textContent = 
    status === "finished" ? "🎉 Campagne terminée avec succès !" :
    status === "paused" ? "⏸️ Campagne en pause" :
    status === "stopped" ? "🛑 Campagne interrompue" :
    "⚡ Campagne en cours d'envoi...";

  if (latestLog) {
    appendLogRow(latestLog);
  }

  if (status === "finished" || status === "stopped") {
    campaignActive = false;
    if (campaignEventSource) campaignEventSource.close();
  }
}

async function pollCampaignStatus() {
  if (!campaignActive) return;
  try {
    const res = await fetch("/api/campaign/progress");
    const data = await res.json();
    handleCampaignProgressUpdate(data);
    if (campaignActive) setTimeout(pollCampaignStatus, 1500);
  } catch {}
}

function appendLogRow(log) {
  currentCampaignLogs.push(log);
  const tr = document.createElement("tr");
  const timeStr = new Date(log.timestamp || Date.now()).toLocaleTimeString();
  const isSuccess = log.success;

  tr.innerHTML = `
    <td style="font-family: var(--font-code); font-size: 11px;">${timeStr}</td>
    <td><strong>${escapeHtml(log.name || "Client")}</strong></td>
    <td style="font-family: var(--font-code);">${escapeHtml(log.destination || "")}</td>
    <td>
      <span class="badge-status ${isSuccess ? 'success' : 'error'}">
        ${isSuccess ? '✓ Envoyé' : '✕ Échec'}
      </span>
    </td>
    <td style="font-size: 12px; color: ${isSuccess ? 'var(--text-secondary)' : '#fb7185'};">
      ${escapeHtml(log.details || log.error || "")}
    </td>
  `;

  logsTableBody.prepend(tr);
}

// Pause / Resume / Stop Campaign
async function togglePauseResume() {
  const action = campaignPaused ? "resume" : "pause";
  try {
    await fetch(`/api/campaign/${action}`, { method: "POST" });
    campaignPaused = !campaignPaused;
    btnPauseResume.textContent = campaignPaused ? "▶️ Reprendre l'envoi" : "⏸️ Mettre en pause";
    showToast(campaignPaused ? "Campagne mise en pause" : "Campagne reprise", "info");
  } catch (err) {
    showToast("Erreur: " + err.message, "error");
  }
}

async function stopCampaign() {
  if (!confirm("Voulez-vous vraiment stopper définitivement cette campagne ?")) return;
  try {
    await fetch("/api/campaign/stop", { method: "POST" });
    campaignActive = false;
    showToast("Campagne interrompue", "info");
  } catch (err) {
    showToast("Erreur: " + err.message, "error");
  }
}

// Export CSV of Campaign
function exportLogsToCsv() {
  if (!currentCampaignLogs.length) {
    showToast("Aucun log d'envoi à exporter pour le moment", "info");
    return;
  }

  let csv = "Heure,Nom,Destination,Statut,Details\n";
  currentCampaignLogs.forEach(l => {
    csv += `"${new Date(l.timestamp).toLocaleTimeString()}","${l.name || ''}","${l.destination || ''}","${l.success ? 'Succès' : 'Échec'}","${(l.details || l.error || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campagne_${currentChannel}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ==========================================================================
// CONTACTS DIRECTORY MODAL
// ==========================================================================
async function openContactsModal() {
  document.getElementById("contactsModal").classList.add("active");
  renderContactsModalTable(contactsCache);
  try {
    const res = await fetch("/api/contacts?limit=200");
    const data = await res.json();
    contactsCache = data.contacts || [];
    renderContactsModalTable(contactsCache);
  } catch {}
}

function closeContactsModal() {
  document.getElementById("contactsModal").classList.remove("active");
}

function renderContactsModalTable(list) {
  const tbody = document.getElementById("contactsModalTableBody");
  tbody.innerHTML = "";
  list.slice(0, 100).forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="var-tag">${c.type === 'user' ? 'Utilisateur' : 'Client'}</span></td>
      <td><strong>${escapeHtml(c.name || 'N/A')}</strong></td>
      <td style="color: ${c.email ? '#34d399' : '#64748b'};">${escapeHtml(c.email || '—')}</td>
      <td style="font-family: var(--font-code); color: ${c.phone ? '#60a5fa' : '#64748b'};">${escapeHtml(c.phone || '—')}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterContactsList() {
  const query = document.getElementById("contactSearchInput").value.toLowerCase().trim();
  if (!query) {
    renderContactsModalTable(contactsCache);
    return;
  }
  const filtered = contactsCache.filter(c => 
    (c.name && c.name.toLowerCase().includes(query)) ||
    (c.email && c.email.toLowerCase().includes(query)) ||
    (c.phone && c.phone.includes(query))
  );
  renderContactsModalTable(filtered);
}

// ==========================================================================
// TOAST NOTIFICATIONS & UTILS
// ==========================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
