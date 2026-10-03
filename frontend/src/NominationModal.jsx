import React, { useState, useEffect, useRef } from 'react';
import { awardsData, awardsContact } from './data';
import { nominationFormFor } from './nominationForms';

const DRAFT_KEY = 'mccia-nomination-draft-v2';
const MAX_FILE_MB = 3;
const STEP_LABELS = ['Select award', 'Organisation & contact', 'Nomination details'];

const readDraft = () => {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; }
};

const fieldError = (field, values) => {
  if (field.type === 'table') {
    const filled = field.rows.every(row => String(values[`${field.key}__${row}`] || '').trim());
    return field.required && !filled ? 'Fill in all three years' : '';
  }
  const value = String(values[field.key] ?? '').trim();
  if (!value) return field.required ? 'Required' : '';
  if (field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) return 'Enter a valid email address';
  if (field.type === 'tel' && (!/^\+?[\d\s().-]{7,20}$/.test(value) || value.replace(/\D/g, '').length < 7)) return 'Enter a valid phone number';
  if (field.pattern && !field.pattern.test(value)) return field.patternMessage || 'Check this value';
  if (field.maxWords && value.split(/\s+/).length > field.maxWords) return `Keep this within ${field.maxWords} words`;
  return '';
};

function NominationModal({ initialAward, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [step, setStep] = useState(1);
  const [draft] = useState(readDraft);
  const [awardTitle, setAwardTitle] = useState(initialAward || draft?.awardTitle || '');
  const [values, setValues] = useState(draft?.values || {});
  const [file, setFile] = useState(null);
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const award = awardsData.find(a => a.title === awardTitle);
  const schema = award ? nominationFormFor(award.id) : null;

  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ awardTitle, values })); } catch { /* storage unavailable */ }
  }, [awardTitle, values]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  useEffect(() => {
    dialogRef.current?.querySelector('.modal-body')?.scrollTo?.({ top: 0 });
  }, [step]);

  useEffect(() => {
    if (submitted) dialogRef.current?.focus();
  }, [submitted]);

  const clearError = key => setErrors(current => {
    if (!current[key]) return current;
    const next = { ...current };
    delete next[key];
    return next;
  });
  const setValue = (key, value) => {
    setValues(current => ({ ...current, [key]: value }));
    clearError(key);
  };

  const fieldsOf = groups => groups.flatMap(group => group.fields);
  const currentFields = () => {
    if (!schema) return [];
    if (step === 2) return fieldsOf(schema.step2);
    if (step === 3) return fieldsOf(schema.step3);
    return [];
  };

  const validate = () => {
    const found = {};
    if (step === 1 && !award) found.award = 'Please select an award';
    currentFields().forEach(field => {
      const message = fieldError(field, values);
      if (message) found[field.key] = message;
    });
    if (step === 3 && !agree) found.agree = 'You must agree to proceed';
    setErrors(found);
    const firstKey = Object.keys(found)[0];
    if (firstKey) {
      const target = firstKey === 'award' ? 'award-category' : firstKey === 'agree' ? 'nomination-consent' : `f-${firstKey}`;
      document.getElementById(target)?.focus();
    }
    return !firstKey;
  };

  const validateOnBlur = field => {
    const message = fieldError(field, values);
    setErrors(current => {
      if (message) return { ...current, [field.key]: message };
      if (!current[field.key]) return current;
      const next = { ...current };
      delete next[field.key];
      return next;
    });
  };

  const readFile = chosen => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(chosen);
  });

  const submit = async () => {
    setSending(true);
    setSendError('');
    try {
      const payload = { awardId: award.id, values, website: honeypot };
      if (file) payload.file = { name: file.name, content: await readFile(file) };
      const response = await fetch('/api/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setSubmitted(true);
    } catch (error) {
      setSendError(error.message === 'Failed to fetch' ? 'Could not reach the server. Check your connection and try again.' : error.message);
    } finally {
      setSending(false);
    }
  };

  const next = () => {
    if (sending || !validate()) return;
    if (step < 3) setStep(step + 1);
    else submit();
  };

  const onEnter = event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && !['checkbox', 'radio', 'file'].includes(event.target.type)) {
      event.preventDefault();
      next();
    }
  };

  const onFile = chosen => {
    if (chosen && chosen.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors(current => ({ ...current, file: `File is larger than ${MAX_FILE_MB} MB. Choose a smaller one.` }));
      return;
    }
    clearError('file');
    setFile(chosen);
  };

  const renderField = field => {
    const id = `f-${field.key}`;
    const error = errors[field.key];
    const common = {
      id,
      'aria-invalid': Boolean(error),
      'aria-describedby': error ? `${id}-error` : undefined,
    };
    const label = (
      <label htmlFor={field.type === 'radio' || field.type === 'table' ? undefined : id}>
        {field.label}{field.required && <span aria-hidden="true"> *</span>}
      </label>
    );
    const errorEl = error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>;
    let control;

    if (field.type === 'textarea') {
      const words = field.maxWords ? String(values[field.key] || '').trim().split(/\s+/).filter(Boolean).length : null;
      control = (
        <>
          <textarea {...common} rows={field.rows} value={values[field.key] || ''} required={field.required} onBlur={() => validateOnBlur(field)} onChange={e => setValue(field.key, e.target.value)} />
          {words !== null && <span className="form-help"><span className="char-count">{words}/{field.maxWords} words</span></span>}
        </>
      );
    } else if (field.type === 'select') {
      control = (
        <select {...common} value={values[field.key] || ''} required={field.required} onChange={e => setValue(field.key, e.target.value)}>
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options.map(option => <option key={option}>{option}</option>)}
        </select>
      );
    } else if (field.type === 'radio') {
      control = (
        <div className="radio-row" role="radiogroup" aria-labelledby={`${id}-label`} {...{ 'aria-describedby': common['aria-describedby'] }}>
          {field.options.map((option, index) => (
            <label key={option} className={`radio-pill ${values[field.key] === option ? 'checked' : ''}`}>
              <input id={index === 0 ? id : undefined} type="radio" name={field.key} value={option} checked={values[field.key] === option} onChange={() => setValue(field.key, option)} />
              {option}
            </label>
          ))}
        </div>
      );
    } else if (field.type === 'table') {
      control = (
        <div className="year-table" role="group" aria-label={field.label} id={id} tabIndex={-1}>
          {field.rows.map(row => (
            <label key={row} className="year-row">
              <span>{row}</span>
              <input type="text" inputMode="numeric" placeholder={field.valueLabel} aria-label={`${field.label}, ${row}`} value={values[`${field.key}__${row}`] || ''} onChange={e => setValue(`${field.key}__${row}`, e.target.value) || clearError(field.key)} />
            </label>
          ))}
        </div>
      );
    } else {
      control = (
        <input
          {...common}
          type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          required={field.required}
          className={field.upper ? 'uppercase-input' : undefined}
          value={values[field.key] || ''}
          onBlur={() => validateOnBlur(field)}
          onChange={e => setValue(field.key, field.upper ? e.target.value.toUpperCase() : e.target.value)}
        />
      );
    }

    return (
      <div key={field.key} className={`form-group ${field.full ? 'span-2' : ''}`}>
        {field.type === 'radio' ? <span className="radio-label" id={`${id}-label`}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</span> : label}
        {field.hint && <span className="form-help" id={`${id}-hint`}>{field.hint}</span>}
        {control}
        {errorEl}
      </div>
    );
  };

  const renderGroups = groups => groups.map(group => (
    <fieldset key={group.title} className="form-section">
      <legend>{group.title}</legend>
      {group.sub && <p className="form-section-sub">{group.sub}</p>}
      <div className="form-grid">{group.fields.map(renderField)}</div>
    </fieldset>
  ));

  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div ref={dialogRef} className="modal glass-card" role="dialog" aria-modal="true" aria-labelledby="nomination-status-title" tabIndex="-1" onClick={e => e.stopPropagation()}>
          <div className="success-screen">
            <h2 id="nomination-status-title">Nomination submitted</h2>
            <p>Thank you. We have received the nomination of <strong>{values.companyName || values.contactPerson}</strong> for the <strong>{award?.title}</strong>.</p>
            {values.email && <p>A confirmation will be sent to <strong>{values.email}</strong>. The Awards Desk will contact you about the next steps.</p>}
            <p>Questions? <strong>{awardsContact.name}</strong>, {awardsContact.role}<br /><a href={`mailto:${awardsContact.email}`}>{awardsContact.email}</a><br /><a href={awardsContact.phoneHref}>{awardsContact.phone}</a> · <a href={awardsContact.mobileHref}>{awardsContact.mobile}</a></p>
            <div className="modal-actions">
              <button className="btn-gold" type="button" onClick={onClose}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div ref={dialogRef} className="modal glass-card" role="dialog" aria-modal="true" aria-labelledby="nomination-title" tabIndex="-1" onClick={e => e.stopPropagation()}>
        <button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose} aria-label="Close nomination form preview">✕</button>
        <div className="modal-head">
          <p className="modal-eyebrow">MCCIA Awards 2026 · Closes 15 November</p>
          <h2 className="modal-title" id="nomination-title">{award ? award.title : 'Nominate your business'}</h2>
          {schema?.subtitle && <p className="modal-subtitle">{schema.subtitle}</p>}
          <div className="form-progress" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Step ${step} of 3: ${STEP_LABELS[step - 1]}`}>
            <div className="form-progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
        <div className="modal-body" onKeyDown={onEnter}>
          <div className="step-indicator">
            {STEP_LABELS.map((l, i) => (
              <React.Fragment key={l}>
                <div
                  className={`step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}
                  aria-current={step === i + 1 ? 'step' : undefined}
                  role={step > i + 1 ? 'button' : undefined}
                  tabIndex={step > i + 1 ? 0 : undefined}
                  onClick={step > i + 1 ? () => setStep(i + 1) : undefined}
                  onKeyDown={step > i + 1 ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStep(i + 1); } } : undefined}
                >
                  {step > i + 1 ? '✓' : i + 1}
                  <span>{l}</span>
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="award-category">Select the award you want to apply for <span aria-hidden="true">*</span></label>
                <select id="award-category" required aria-invalid={Boolean(errors.award)} aria-describedby={errors.award ? 'award-category-error' : undefined} value={awardTitle} onChange={e => { setAwardTitle(e.target.value); clearError('award'); }}>
                  <option value="">Choose an award</option>
                  {awardsData.map(a => <option key={a.id} value={a.title}>{a.title} ({a.tag})</option>)}
                </select>
                {errors.award && <span className="field-error" id="award-category-error" role="alert">{errors.award}</span>}
              </div>
              {award && (
                <div className="award-preview glass-card" style={{ '--tag-color': award.tagColor }}>
                  <div className="ap-header">
                    <div>
                      <span className="award-tag">{award.tag}</span>
                      <h4>{award.title}</h4>
                    </div>
                  </div>
                  <p className="ap-elig"><strong>Eligibility:</strong> {award.eligibility}</p>
                  <p className="ap-prize">🏆 {award.prize}</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && schema && (
            <div className="form-step">
              {schema.note && <p className="form-help">{schema.note}</p>}
              <p className="form-required-note"><span aria-hidden="true">*</span> Required{draft?.values && Object.keys(draft.values).length > 0 && ' · We restored your earlier draft'}</p>
              {renderGroups(schema.step2)}
            </div>
          )}

          {step === 3 && schema && (
            <div className="form-step">
              <div className="review-summary">
                <div><span>Nominee</span><strong>{values.companyName || values.contactPerson || '—'}</strong></div>
                <div><span>Award</span><strong>{award.title}</strong></div>
                <button type="button" className="review-edit" onClick={() => setStep(2)}>Edit details</button>
              </div>
              {renderGroups(schema.step3)}
              {schema.file && (
                <div className="form-group">
                  <label htmlFor="fileUpload">Attached file (optional)</label>
                  <div className={`file-drop ${file ? 'has-file' : ''}`}>
                    <input type="file" id="fileUpload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" aria-describedby="supporting-file-help" onChange={e => onFile(e.target.files?.[0] || null)} />
                    <span className="file-drop-text">{file ? <><strong>{file.name}</strong> · {(file.size / 1024).toFixed(0)} KB</> : <><strong>Choose a file</strong> or drag it here</>}</span>
                    {file && <button type="button" className="file-remove" onClick={() => { setFile(null); document.getElementById('fileUpload').value = ''; }}>Remove</button>}
                  </div>
                  <span className="form-help" id="supporting-file-help" aria-live="polite">
                    PDF, DOC, DOCX, JPG or PNG, up to {MAX_FILE_MB} MB. A product catalogue and photograph help the shortlisting.
                  </span>
                  {errors.file && <span className="field-error" role="alert">{errors.file}</span>}
                </div>
              )}
              <ul className="form-process-note">
                <li>Applicants are shortlisted on the information you provide.</li>
                <li>Shortlisted applicants are asked for catalogues, sales literature, bio-data and photographs.</li>
                <li>Selected candidates are invited for an interview and presentation.</li>
                <li>The Selection Committee may request more information or visit your works or factory.</li>
              </ul>
              <input className="hp-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
              <div className="form-group checkbox-group">
                <label>
                  <input id="nomination-consent" type="checkbox" checked={agree} aria-invalid={Boolean(errors.agree)} aria-describedby={errors.agree ? 'nomination-consent-error' : undefined} onChange={e => { setAgree(e.target.checked); clearError('agree'); }} />
                  <span>I confirm the information provided is accurate and I consent to MCCIA using it for evaluation purposes.</span>
                </label>
                {errors.agree && <span className="field-error" id="nomination-consent-error" role="alert">{errors.agree}</span>}
              </div>
              {sendError && <p className="form-send-error" role="alert">{sendError}</p>}
            </div>
          )}
        </div>

        <div className="modal-actions">
          {step > 1 && <button className="btn-ghost" type="button" onClick={() => setStep(step - 1)}>← Back</button>}
          <span className="modal-step-count">Step {step} of 3</span>
          <button className="btn-gold" type="button" onClick={next} disabled={sending}>
            {step < 3 ? 'Continue →' : sending ? 'Submitting…' : 'Submit nomination'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NominationModal;
