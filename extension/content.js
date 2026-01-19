// Spool Swatch MakerWorld Extension - Content Script
// Imports 3MF projects from MakerWorld to Spool Swatch

// Find download button and extract 3MF file
async function get3MFFileUrl() {
  // Look for MakerWorld's specific DOM structure
  // The 3MF button is inside .MuiStack-root after <hr>
  const hr = document.querySelector('hr');
  if (hr) {
    // Find the next .MuiStack-root after hr
    let container = hr.nextElementSibling;
    while (container && !container.classList.contains('MuiStack-root')) {
      container = container.nextElementSibling;
    }

    if (container) {
      const downloadButton = Array.from(container.querySelectorAll('button, a'))
        .find(el => el.textContent.includes('3MF') ||
          el.textContent.includes('3mf'));

      if (downloadButton) {
        let url = downloadButton.href;
        if (!url) {
          url = downloadButton.getAttribute('data-url') ||
            downloadButton.getAttribute('data-download-url');
        }
        if (url && !url.startsWith('http')) {
          url = new URL(url, window.location.origin).href;
        }
        return url;
      }
    }
  }

  // Fallback: search entire page
  const downloadButton = Array.from(document.querySelectorAll('button, a'))
    .find(el => el.textContent.includes('3MF') ||
      el.textContent.includes('Download') ||
      el.textContent.includes('3mf') ||
      el.textContent.includes('下载'));

  if (!downloadButton) {
    console.error('No 3MF download button found');
    return null;
  }

  let url = downloadButton.href;

  if (!url) {
    url = downloadButton.getAttribute('data-url') ||
      downloadButton.getAttribute('data-download-url') ||
      downloadButton.getAttribute('href');
  }

  if (url && !url.startsWith('http')) {
    url = new URL(url, window.location.origin).href;
  }

  return url;
}

// Download and read 3MF file as ArrayBuffer
async function download3MFFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error downloading 3MF file:', error);
    return null;
  }
}

// Extract project name from page
function getProjectName() {
  const titleEl = document.querySelector('h1') ||
    document.querySelector('[data-title]') ||
    document.querySelector('title');

  if (!titleEl) return 'Imported Project';

  let title = titleEl.textContent.trim();
  // Clean up title
  title = title.replace(/\s*-\s*MakerWorld.*/, '').substring(0, 100);

  return title;
}

// Add import button to page
function addButtonToPage() {
  // Check if button already exists
  if (document.getElementById('spool-swatch-button')) {
    return;
  }

  // Find the 3MF download button anywhere on the page
  const downloadButton = Array.from(document.querySelectorAll('button, a'))
    .find(el => el.textContent.includes('3MF') || el.textContent.includes('3mf'));

  if (!downloadButton) {
    console.warn('3MF download button not found, skipping Spool Swatch button');
    return;
  }

  console.log('Found 3MF button:', downloadButton);
  console.log('Parent container:', downloadButton.parentElement);

  // Create button with same styling as 3MF button for consistency
  const button = document.createElement('button');
  button.id = 'spool-swatch-button';
  button.textContent = '📥 In Spool Swatch importieren';

  // Copy styling from the 3MF button to match MakerWorld design
  const computedStyle = window.getComputedStyle(downloadButton);
  button.style.cssText = downloadButton.style.cssText;
  button.style.cssText += `
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    color: white !important;
    margin: 10px;
    transition: all 0.3s ease;
  `;

  button.onmouseover = () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)';
  };

  button.onmouseout = () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = 'none';
  };

  button.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    button.disabled = true;
    button.textContent = '⏳ Wird heruntergeladen...';

    // Get 3MF file URL
    const fileUrl = await get3MFFileUrl();
    if (!fileUrl) {
      button.textContent = '❌ Fehler: 3MF nicht gefunden';
      button.disabled = false;
      setTimeout(() => {
        button.textContent = '📥 In Spool Swatch importieren';
      }, 3000);
      return;
    }

    console.log('3MF URL found:', fileUrl);

    // Download file
    const fileData = await download3MFFile(fileUrl);
    if (!fileData) {
      button.textContent = '❌ Download fehlgeschlagen';
      button.disabled = false;
      setTimeout(() => {
        button.textContent = '📥 In Spool Swatch importieren';
      }, 3000);
      return;
    }

    // Convert to base64
    const binary = String.fromCharCode.apply(null, new Uint8Array(fileData));
    const base64 = btoa(binary);

    // Store project data
    const projectName = getProjectName();
    const projectData = {
      name: projectName,
      file: base64,
      timestamp: new Date().toISOString(),
      source: 'MakerWorld'
    };

    chrome.storage.local.set({ pendingProject: projectData }, () => {
      button.textContent = '✅ Öffne Spool Swatch...';

      // Open Spool Swatch with import flag
      const spoolSwatchUrl = 'http://localhost:5173';
      window.open(`${spoolSwatchUrl}?import=true`, '_blank');

      // Reset button after 2 seconds
      setTimeout(() => {
        button.disabled = false;
        button.textContent = '📥 In Spool Swatch importieren';
      }, 2000);
    });
  };

  // Insert button right after the 3MF button in the same container
  downloadButton.parentElement.insertBefore(button, downloadButton.nextSibling);
  console.log('Spool Swatch button added successfully');
}

// Wait for page to load and add button
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addButtonToPage);
} else {
  addButtonToPage();
}

// Also watch for dynamic content changes
const observer = new MutationObserver(() => {
  if (!document.getElementById('spool-swatch-button')) {
    addButtonToPage();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
