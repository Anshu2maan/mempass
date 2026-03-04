// ui/preview.js - file preview and sharing helpers for document vault

// ==================== PREVIEW DOCUMENT FILE ====================
async function previewDocumentFile(docId, index) {
    if (!window.isVaultUnlocked) {
        showPinModal('verify');
        return;
    }

    const doc = await window.documentVault.getDocument(docId, false);
    if (!doc?.files?.[index]) {
        Utils.showToast('File not found');
        return;
    }

    const fileMeta = doc.files[index];
    const modal = document.getElementById('filePreviewModal');
    const content = document.getElementById('filePreviewContent');
    const titleEl = document.getElementById('filePreviewTitle');

    titleEl.textContent = `${fileMeta.name || 'File'} (${fileMeta.type || ''})`;
    content.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;">Decrypting...</div>';
    modal.style.display = 'flex';

    let objUrl = null;

    try {
        const blob = await window.documentVault.decryptFile(fileMeta);
        objUrl = URL.createObjectURL(blob);

        window.currentPreview = {
            docId,
            index,
            blob,
            filename: fileMeta.name,
            mime: fileMeta.type,
            objUrl                     // ← important for cleanup
        };

        content.innerHTML = '';

        const isImage = (fileMeta.type || '').startsWith('image/');
        const isPdf   = (fileMeta.type || '').toLowerCase().includes('pdf');

        if (isImage) {
            const img = document.createElement('img');
            img.src = objUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '70vh';
            img.style.objectFit = 'contain';
            content.appendChild(img);

        } else if (isPdf) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                // ───── MOBILE: Native PDF viewer (best experience) ─────
                content.innerHTML = `
                    <div style="text-align:center;padding:60px 20px;">
                        <div style="font-size:4.5rem;margin-bottom:20px;">📕</div>
                        <h3>PDF Ready</h3>
                        <p style="color:#718096;margin:15px 0 30px;">Tap to open in your browser's PDF viewer</p>
                        <button onclick="openPdfInNewTab()" 
                                style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;
                                       padding:18px 40px;font-size:1.15rem;border:none;border-radius:16px;
                                       box-shadow:0 10px 25px rgba(102,126,234,0.35);">
                            📄 Open PDF
                        </button>
                    </div>`;
            } else {
                // ───── DESKTOP: Embedded iframe (as before) ─────
                const iframe = document.createElement('iframe');
                iframe.src = objUrl;
                iframe.style.width = '100%';
                iframe.style.height = '70vh';
                iframe.style.border = 'none';
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
                content.appendChild(iframe);
            }
        } else {
            // Other file types
            content.innerHTML = `
                <div style="text-align:center;padding:60px 20px;">
                    <div style="font-size:3.5rem;margin-bottom:20px;">📎</div>
                    <p><strong>${Utils.escapeHtml(fileMeta.name)}</strong></p>
                    <p style="color:#718096;">${window.documentVault.formatFileSize(fileMeta.size)}</p>
                    <button onclick="downloadCurrentPreview()" style="margin-top:25px;">⬇️ Download File</button>
                </div>`;
        }
    } catch (err) {
        console.error('Preview error:', err);
        content.innerHTML = '<div style="padding:40px;color:#f56565;text-align:center;">Unable to preview this file.</div>';
    }

    resetInactivityTimer();
}

function sharePreview() {
    if (!window.currentPreview) {
        alert('No preview available to share.');
        return;
    }
    const { blob, filename, mime } = window.currentPreview;

    // Web Share Level 2 (files)
    try {
        const file = new File([blob], filename || 'file', { type: mime });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: filename }).catch(err => alert('Share failed: ' + err));
            return;
        }
    } catch (e) {
        // ignore
    }

    // Fallback: try sharing a blob URL (may not work everywhere)
    if (navigator.share) {
        const url = URL.createObjectURL(blob);
        navigator.share({ title: filename, text: filename, url }).catch(() => {
            alert('Sharing not supported. Please download and share manually.');
        }).finally(() => setTimeout(() => URL.revokeObjectURL(url), 5000));
        return;
    }

    alert('Sharing not supported on this device. Please download the file and share it manually.');
}

function openPdfInNewTab() {
    if (window.currentPreview?.objUrl) {
        window.open(window.currentPreview.objUrl, '_blank');
    } else {
        Utils.showToast('PDF not ready');
    }
}

function downloadCurrentPreview() {
    if (!window.currentPreview?.blob) return;
    const { blob, filename } = window.currentPreview;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 8000);
}

// export
window.previewDocumentFile = previewDocumentFile;
window.sharePreview = sharePreview;
window.openPdfInNewTab = openPdfInNewTab;
window.downloadCurrentPreview = downloadCurrentPreview;
