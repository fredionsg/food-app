(() => {
  function validateProfileForExport(profile) {
    const errors = [];
    if (!profile) {
      errors.push('No saved profile found. Complete setup first.');
      return errors;
    }

    const requiredFields = [
      ['firstName', 'First name is missing.'],
      ['lastName', 'Last name is missing.'],
      ['email', 'Email is missing.'],
      ['dob', 'Date of birth is missing.'],
      ['country', 'Country is missing.']
    ];

    requiredFields.forEach(([field, message]) => {
      if (!profile[field] || !String(profile[field]).trim()) {
        errors.push(message);
      }
    });

    if (!Array.isArray(profile.quickChoices) || profile.quickChoices.length === 0) {
      errors.push('Select at least one quick choice in setup.');
    }
    if (!Array.isArray(profile.allergies) || profile.allergies.length === 0) {
      errors.push('Add at least one allergy in setup.');
    }
    if (!Array.isArray(profile.avoid) || profile.avoid.length === 0) {
      errors.push('Add at least one food to avoid in setup.');
    }
    if (!Array.isArray(profile.preferred) || profile.preferred.length === 0) {
      errors.push('Add at least one preferred food in setup.');
    }
    if (!profile.spiceLevel || !String(profile.spiceLevel).trim()) {
      errors.push('Choose a spice level in setup.');
    }

    return errors;
  }

  async function exportDietaryProfile({ onError, onSuccess } = {}) {
    const storedEmail = localStorage.getItem('userEmail');
    const query = storedEmail ? `?email=${encodeURIComponent(storedEmail)}` : '';

    try {
      const profileRes = await fetch(`/api/profile${query}`);
      if (!profileRes.ok) {
        throw new Error('Could not load profile.');
      }
      const profile = await profileRes.json();
      const validationErrors = validateProfileForExport(profile);
      if (validationErrors.length) {
        throw new Error(validationErrors.join(' '));
      }

      const previewWindow = window.open('', '_blank', 'noopener');
      if (!previewWindow) {
        throw new Error('Please allow pop-ups to preview the export.');
      }

      const pdfRes = await fetch(`/api/profile/export${query}`);
      if (!pdfRes.ok) {
        const body = await pdfRes.json().catch(() => ({}));
        previewWindow.close();
        throw new Error(body.error || 'Could not generate export.');
      }

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      previewWindow.location = url;
      if (onSuccess) onSuccess();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        alert(error.message || 'Export failed.');
      }
    }
  }

  window.exportDietaryProfile = exportDietaryProfile;
})();
