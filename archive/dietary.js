(() => {
  const chips = Array.from(document.querySelectorAll('.chip'));
  const segButtons = Array.from(document.querySelectorAll('.seg button'));
  const feedback = document.querySelector('.form-feedback');
  const saveButton = document.querySelector('.save-button');
  const modal = document.querySelector('.modal');
  const changesList = document.querySelector('.changes-list');
  const modalCancel = document.querySelector('.modal-cancel');
  const modalConfirm = document.querySelector('.modal-confirm');

  const tokenControllers = {
    allergies: setupTokenField('allergies-field', 'allergies-input'),
    avoid: setupTokenField('avoid-field', 'avoid-input'),
    preferred: setupTokenField('pref-field', 'pref-input')
  };

  let originalProfile = null;

  chips.forEach(chip => {
    chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') || 'false');
    chip.addEventListener('click', () => {
      const active = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', String(!active));
    });
  });

  if (segButtons.length) {
    const hasSelected = segButtons.some(button => button.getAttribute('aria-pressed') === 'true');
    if (!hasSelected) segButtons[0].setAttribute('aria-pressed', 'true');
  }

  segButtons.forEach(button => {
    button.addEventListener('click', () => {
      segButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
    });
  });

  if (modal) {
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal();
    });
  }

  function showFeedback(message, type = 'error') {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `form-feedback is-${type}`;
  }

  function clearFeedback() {
    if (!feedback) return;
    feedback.textContent = '';
    feedback.className = 'form-feedback';
  }

  function setupTokenField(fieldId, inputId) {
    const field = document.getElementById(fieldId);
    const input = document.getElementById(inputId);
    if (!field || !input) return null;

    const getTokens = () => Array.from(field.querySelectorAll('.token span')).map(span => span.textContent.trim());
    const clearTokens = () => field.querySelectorAll('.token').forEach(token => token.remove());

    const addToken = text => {
      const value = (text || '').trim().replace(/[,]+$/, '');
      if (!value) return;
      const exists = getTokens().some(token => token.toLowerCase() === value.toLowerCase());
      if (exists) return;
      const token = document.createElement('span');
      token.className = 'token';
      const label = document.createElement('span');
      label.textContent = value;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Remove ' + value);
      button.textContent = 'x';
      button.addEventListener('click', () => token.remove());
      token.append(label, button);
      field.insertBefore(token, input);
    };

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        addToken(input.value);
        input.value = '';
      } else if (event.key === 'Backspace' && !input.value) {
        const last = field.querySelector('.token:last-of-type');
        if (last) last.remove();
      }
    });

    input.addEventListener('paste', event => {
      const text = (event.clipboardData || window.clipboardData).getData('text');
      if (text && text.includes(',')) {
        event.preventDefault();
        text.split(',').forEach(item => addToken(item));
        input.value = '';
      }
    });

    return { field, input, addToken, clearTokens, getTokens };
  }

  function getSelectedChips() {
    return chips
      .filter(chip => chip.getAttribute('aria-pressed') === 'true')
      .map(chip => chip.textContent.trim());
  }

  function getSpiceLevel() {
    const selected = segButtons.find(button => button.getAttribute('aria-pressed') === 'true');
    return selected ? selected.textContent.trim() : '';
  }

  function gatherDietaryData() {
    return {
      quickChoices: getSelectedChips(),
      allergies: tokenControllers.allergies?.getTokens() || [],
      avoid: tokenControllers.avoid?.getTokens() || [],
      preferred: tokenControllers.preferred?.getTokens() || [],
      spiceLevel: getSpiceLevel(),
      specialNotes: document.getElementById('special-notes').value.trim()
    };
  }

  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
    document.querySelectorAll('.field-error-text').forEach(el => el.remove());
  }

  function addFieldError(element, message) {
    if (!element) return;
    element.classList.add('field-error');
    let existing = element.parentElement?.querySelector('.field-error-text');
    if (!existing) {
      existing = document.createElement('p');
      existing.className = 'field-error-text';
      existing.textContent = message;
      (element.parentElement || element).appendChild(existing);
    } else {
      existing.textContent = message;
    }
  }

  function validateDietary(data, showErrors = false) {
    if (showErrors) clearFieldErrors();
    const errors = [];

    if (!data.quickChoices.length) {
      errors.push('Select at least one quick choice.');
      if (showErrors) addFieldError(document.querySelector('.chips'), 'Select at least one quick choice.');
    }
    if (!data.allergies.length) {
      errors.push('Add at least one allergy.');
      if (showErrors) addFieldError(tokenControllers.allergies?.field, 'Add at least one allergy.');
    }
    if (!data.avoid.length) {
      errors.push('Add at least one food to avoid.');
      if (showErrors) addFieldError(tokenControllers.avoid?.field, 'Add at least one food to avoid.');
    }
    if (!data.preferred.length) {
      errors.push('Add at least one preferred food.');
      if (showErrors) addFieldError(tokenControllers.preferred?.field, 'Add at least one preferred food.');
    }
    if (!data.spiceLevel) {
      errors.push('Select a spice level.');
      if (showErrors) addFieldError(document.querySelector('.seg'), 'Select a spice level.');
    }

    return { valid: errors.length === 0, errors };
  }

  function describeArrayChanges(label, original = [], current = []) {
    const origSet = new Set(original);
    const currSet = new Set(current);
    const added = current.filter(item => !origSet.has(item));
    const removed = original.filter(item => !currSet.has(item));
    if (!added.length && !removed.length) return null;
    const parts = [];
    if (added.length) parts.push(`added ${added.join(', ')}`);
    if (removed.length) parts.push(`removed ${removed.join(', ')}`);
    return `${label}: ${parts.join('; ')}`;
  }

  function buildChangesSummary(original, current) {
    if (!original) {
      return ['This will create your dietary profile with the selections shown.'];
    }

    const changes = [];
    const quickChange = describeArrayChanges('Quick choices', original.quickChoices || [], current.quickChoices);
    if (quickChange) changes.push(quickChange);
    const allergyChange = describeArrayChanges('Allergies', original.allergies || [], current.allergies);
    if (allergyChange) changes.push(allergyChange);
    const avoidChange = describeArrayChanges('Foods to avoid', original.avoid || [], current.avoid);
    if (avoidChange) changes.push(avoidChange);
    const prefChange = describeArrayChanges('Preferred foods', original.preferred || [], current.preferred);
    if (prefChange) changes.push(prefChange);

    if ((original.spiceLevel || '') !== current.spiceLevel) {
      changes.push(`Spice level: ${original.spiceLevel || 'None'} → ${current.spiceLevel}`);
    }

    if ((original.specialNotes || '') !== current.specialNotes) {
      changes.push('Special notes updated.');
    }

    return changes;
  }

  function openModal(changes) {
    if (!modal || !changesList) return;
    changesList.innerHTML = '';
    changes.forEach(change => {
      const li = document.createElement('li');
      li.textContent = change;
      changesList.appendChild(li);
    });
    modal.hidden = false;
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
  }

  async function confirmAndSave() {
    if (!saveButton || (modal && modal.hidden === false)) return;
    clearFeedback();
    const dietaryData = gatherDietaryData();
    const validation = validateDietary(dietaryData, true);

    if (!validation.valid) {
      showFeedback(validation.errors.join(' '), 'error');
      return;
    }

    const changes = buildChangesSummary(originalProfile && {
      quickChoices: originalProfile.quickChoices || [],
      allergies: originalProfile.allergies || [],
      avoid: originalProfile.avoid || [],
      preferred: originalProfile.preferred || [],
      spiceLevel: originalProfile.spiceLevel || '',
      specialNotes: originalProfile.specialNotes || ''
    }, dietaryData);

    if (!changes.length) {
      showFeedback('No changes detected.', 'error');
      return;
    }

    if (!modal || !modalConfirm || !modalCancel) {
      showFeedback('Confirmation dialog unavailable.', 'error');
      return;
    }

    openModal(changes);

    const handleConfirm = async () => {
      closeModal();
      if (!originalProfile) {
        showFeedback('Personal details missing. Complete the full setup first.', 'error');
        return;
      }

      const payload = {
        firstName: originalProfile.firstName,
        lastName: originalProfile.lastName,
        email: originalProfile.email,
        dob: originalProfile.dob,
        country: originalProfile.country,
        medicalNotes: originalProfile.medicalNotes || '',
        quickChoices: dietaryData.quickChoices,
        allergies: dietaryData.allergies,
        avoid: dietaryData.avoid,
        preferred: dietaryData.preferred,
        spiceLevel: dietaryData.spiceLevel,
        specialNotes: dietaryData.specialNotes
      };

      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message = body.errors?.join(' ') || 'Could not save your profile. Please try again.';
          showFeedback(message, 'error');
          return;
        }

        originalProfile = { ...originalProfile, ...payload };
        showFeedback('Profile saved! Changes are live.', 'success');
      } catch (err) {
        console.error(err);
        showFeedback('We could not reach the server. Make sure it is running and try again.', 'error');
      }
    };

    const handleCancel = () => {
      closeModal();
    };

    modalConfirm.addEventListener('click', handleConfirm, { once: true });
    modalCancel.addEventListener('click', handleCancel, { once: true });
  }

  async function loadProfile() {
    try {
      const storedEmail = localStorage.getItem('userEmail');
      const query = storedEmail ? `?email=${encodeURIComponent(storedEmail)}` : '';
      const res = await fetch(`/api/profile${query}`);
      if (!res.ok) throw new Error('Failed to load profile');
      const profile = await res.json();
      if (!profile) {
        showFeedback('No saved profile found. Complete the setup first.', 'error');
        if (saveButton) saveButton.disabled = true;
        return;
      }
      originalProfile = profile;
      populateForm(profile);
    } catch (err) {
      console.error(err);
      showFeedback('Could not load your profile. Make sure the server is running.', 'error');
      if (saveButton) saveButton.disabled = true;
    }
  }

  function populateForm(profile) {
    const quickSet = new Set((profile.quickChoices || []).map(q => q.toLowerCase()));
    chips.forEach(chip => {
      const selected = quickSet.has(chip.textContent.trim().toLowerCase());
      chip.setAttribute('aria-pressed', String(selected));
    });

    tokenControllers.allergies?.clearTokens();
    (profile.allergies || []).forEach(value => tokenControllers.allergies?.addToken(value));

    tokenControllers.avoid?.clearTokens();
    (profile.avoid || []).forEach(value => tokenControllers.avoid?.addToken(value));

    tokenControllers.preferred?.clearTokens();
    (profile.preferred || []).forEach(value => tokenControllers.preferred?.addToken(value));

    segButtons.forEach(button => {
      const match = button.textContent.trim() === profile.spiceLevel;
      button.setAttribute('aria-pressed', String(match));
    });

    document.getElementById('special-notes').value = profile.specialNotes || '';
    clearFeedback();
    if (saveButton) saveButton.disabled = false;
  }

  saveButton?.addEventListener('click', confirmAndSave);
  loadProfile();
})();
