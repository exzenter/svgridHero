// Hardcoded presets - fill these manually
const presets = {
    preset1: null, // Placeholder - fill manually
    preset2: null, // Placeholder - fill manually
    preset3: null, // Placeholder - fill manually
    preset4: null, // Placeholder - fill manually
    preset5: null, // Placeholder - fill manually
    preset6: null, // Placeholder - fill manually
    preset7: null, // Placeholder - fill manually
    preset8: null, // Placeholder - fill manually
    preset9: null  // Placeholder - fill manually
};

// Initialize preset buttons
function initPresets() {
    const container = document.getElementById('presets-container');
    
    for (let i = 1; i <= 9; i++) {
        const button = document.createElement('button');
        button.className = 'preset-button';
        button.textContent = `Preset ${i}`;
        button.id = `preset-${i}-button`;
        
        button.addEventListener('click', () => {
            const presetKey = `preset${i}`;
            const preset = presets[presetKey];
            if (preset) {
                applyPreset(preset);
            }
        });
        
        container.appendChild(button);
    }
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPresets);
} else {
    initPresets();
}

