// QR Code Generator
// Loads QR code data from data.json and generates QR codes on contact and CV pages

let qrCodesData = [];

// Load QR codes data
async function loadQRCodesData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        qrCodesData = data.qrcodes || [];
        generateQRCodes();
    } catch (error) {
        console.error('Error loading QR codes data:', error);
    }
}

// Generate QR codes
function generateQRCodes() {
    const container = document.getElementById('qrCodesContainer');
    if (!container) return;

    container.innerHTML = '';

    // Filter enabled QR codes
    const enabledQRCodes = qrCodesData.filter(qr => qr.enabled);

    if (enabledQRCodes.length === 0) {
        container.innerHTML = '<p class="no-qrcodes">No QR codes available at the moment.</p>';
        return;
    }

    enabledQRCodes.forEach(qrData => {
        // Create QR code card
        const qrCard = document.createElement('div');
        qrCard.className = 'qr-code-item';

        // Create QR code container
        const qrCodeDiv = document.createElement('div');
        qrCodeDiv.className = 'qr-code';
        qrCodeDiv.id = `qrcode-${qrData.id}`;

        // Create label with icon
        const label = document.createElement('p');
        label.className = 'qr-code-label';
        label.innerHTML = '<i class="' + qrData.icon + '"></i> ' + qrData.label;

        // Append elements: QR first, then label below
        qrCard.appendChild(qrCodeDiv);
        qrCard.appendChild(label);
        container.appendChild(qrCard);

        // Generate QR code
        try {
            new QRCode(qrCodeDiv, {
                text: qrData.data,
                width: 128,
                height: 128,
                colorDark: "#1e293b",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error(`Error generating QR code for ${qrData.label}:`, error);
            qrCodeDiv.innerHTML = '<p class="qr-error">Failed to generate QR code</p>';
        }

        // Click to enlarge
        qrCard.style.cursor = 'pointer';
        qrCard.addEventListener('click', function() {
            openQROverlay(qrData);
        });
    });
}

// Open QR code overlay
function openQROverlay(qrData) {
    // Remove existing overlay if any
    const existing = document.getElementById('qrOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'qrOverlay';
    overlay.className = 'qr-overlay';

    const card = document.createElement('div');
    card.className = 'qr-overlay-card';

    const qrDiv = document.createElement('div');
    qrDiv.className = 'qr-overlay-code';

    const labelEl = document.createElement('p');
    labelEl.className = 'qr-overlay-label';
    labelEl.innerHTML = '<i class="' + qrData.icon + '"></i> ' + qrData.label;

    card.appendChild(qrDiv);
    card.appendChild(labelEl);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Generate larger QR code
    new QRCode(qrDiv, {
        text: qrData.data,
        width: 256,
        height: 256,
        colorDark: "#1e293b",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Animate in
    requestAnimationFrame(function() {
        overlay.classList.add('active');
    });

    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(function() { overlay.remove(); }, 200);
        }
    });

    // Close on Escape
    function onKey(e) {
        if (e.key === 'Escape') {
            overlay.classList.remove('active');
            setTimeout(function() { overlay.remove(); }, 200);
            document.removeEventListener('keydown', onKey);
        }
    }
    document.addEventListener('keydown', onKey);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadQRCodesData);
} else {
    loadQRCodesData();
}
