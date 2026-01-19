// Popup script

document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const filamentDataEl = document.getElementById('filament-data');
  const noDataEl = document.getElementById('noData');
  
  loadingEl.style.display = 'block';
  
  try {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    // Request filament data from content script
    chrome.tabs.sendMessage(currentTab.id, { action: 'getFilamentData' }, (filament) => {
      loadingEl.style.display = 'none';
      
      if (filament && filament.name) {
        displayFilament(filament);
        setupButtons(filament);
      } else {
        noDataEl.style.display = 'block';
      }
    });
  } catch (err) {
    console.error('Error:', err);
    loadingEl.style.display = 'none';
    noDataEl.style.display = 'block';
  }
});

function displayFilament(filament) {
  document.getElementById('filament-data').style.display = 'block';
  document.getElementById('colorSwatch').style.backgroundColor = filament.colorHex || '#888';
  document.getElementById('filamentName').textContent = filament.name;
  document.getElementById('filamentMaterial').textContent = `${filament.vendor} · ${filament.material}`;
  document.getElementById('filamentPrice').textContent = `€${filament.price.toFixed(2)}/kg`;
}

function setupButtons(filament) {
  const addBtn = document.getElementById('addBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const statusEl = document.getElementById('status');
  
  addBtn.onclick = async () => {
    statusEl.textContent = 'Öffne Spool Swatch...';
    statusEl.className = 'status show';
    
    // Try to send to Spool Swatch app
    const spoolSwatchUrl = 'https://spoolswatch.disane.dev/';
    
    // Store filament data in localStorage for the app to pick up
    await chrome.storage.local.set({
      pendingFilament: filament,
      timestamp: Date.now()
    });
    
    // Open Spool Swatch in new tab
    chrome.tabs.create({ url: spoolSwatchUrl });
    
    setTimeout(() => {
      statusEl.textContent = '✓ Geöffnet!';
      statusEl.className = 'status show success';
      setTimeout(() => {
        statusEl.className = 'status';
      }, 2000);
    }, 500);
  };
  
  settingsBtn.onclick = () => {
    chrome.runtime.openOptionsPage?.();
  };
}
