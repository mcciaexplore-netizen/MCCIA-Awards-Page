import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { awardsData, awardsContact } from './data';
import { nominationFormFor } from './nominationForms';
import './App.css'; // or a new css if needed, but App.css has form styles

const DRAFT_KEY = 'mccia-nomination-draft-v3';
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

export default function NominatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialAwardFromUrl = searchParams.get('award') || '';

  const [draft] = useState(readDraft);
  const [awardTitle, setAwardTitle] = useState(initialAwardFromUrl || draft?.awardTitle || '');
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
    return [...fieldsOf(schema.step2), ...fieldsOf(schema.step3)];
  };

  const validate = () => {
    const found = {};
    if (!award) found.award = 'Please select an award';
    currentFields().forEach(field => {
      const message = fieldError(field, values);
      if (message) found[field.key] = message;
    });
    if (!agree) found.agree = 'You must agree to proceed';
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
      // Simulate network request since there is no backend yet
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      setSendError(error.message === 'Failed to fetch' ? 'Could not reach the server. Check your connection and try again.' : error.message);
    } finally {
      setSending(false);
    }
  };

  const submitForm = () => {
    if (sending || !validate()) return;
    submit();
  };

  const onEnter = event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && !['checkbox', 'radio', 'file'].includes(event.target.type)) {
      event.preventDefault();
      // Optional: Move focus to next field instead of submitting, since it's a long form
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
          <textarea {...common} rows={field.rows} value={values[field.key] || ''} required={field.required} onBlur={() => validateOnBlur(field)} onChange={e => setValue(field.key, e.target.value)} style={{ background: '#ffffff', color: '#000000', padding: '0.8rem', border: '1px solid #ced4da', borderRadius: '4px', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }} />
          {words !== null && <span className="form-help"><span className="char-count">{words}/{field.maxWords} words</span></span>}
        </>
      );
    } else if (field.type === 'select') {
      control = (
        <select {...common} value={values[field.key] || ''} required={field.required} onChange={e => setValue(field.key, e.target.value)} style={{ background: '#ffffff', color: '#000000', padding: '0.8rem', border: '1px solid #ced4da', borderRadius: '4px', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}>
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
              <input type="text" inputMode="numeric" placeholder={field.valueLabel} aria-label={`${field.label}, ${row}`} value={values[`${field.key}__${row}`] || ''} onChange={e => setValue(`${field.key}__${row}`, e.target.value) || clearError(field.key)} style={{ background: '#ffffff', color: '#000000', padding: '0.8rem', border: '1px solid #ced4da', borderRadius: '4px', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }} />
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
          style={{ background: '#ffffff', color: '#000000', padding: '0.8rem', border: '1px solid #ced4da', borderRadius: '4px', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}
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
      <div className="nominate-fullscreen">
        <div className="nominate-sidebar">
          <div className="sidebar-sticky">
            <Link to={award ? `/awards/${award.id}` : "/awards"} style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', fontWeight: 600 }}>← Back to Award Details</Link>
            <p className="modal-eyebrow">MCCIA Awards 2026</p>
            <h1 className="modal-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.2 }}>{award ? award.title : 'Nominate your business'}</h1>
          </div>
        </div>
        <div className="nominate-form-container">
          <div className="form-wrapper glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>Nomination submitted</h2>
            <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Thank you. We have received the nomination of <strong>{values.companyName || values.contactPerson}</strong> for the <strong>{award?.title}</strong>.</p>
            {values.email && <p style={{ marginTop: '1rem' }}>A confirmation will be sent to <strong>{values.email}</strong>. The Awards Desk will contact you about the next steps.</p>}
            <div style={{ marginTop: '3rem', padding: '2rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <p>Questions?</p>
              <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}><strong>{awardsContact.name}</strong>, {awardsContact.role}<br /><a href={`mailto:${awardsContact.email}`} style={{ color: 'var(--accent)' }}>{awardsContact.email}</a><br /><a href={awardsContact.phoneHref} style={{ color: 'var(--text-light)' }}>{awardsContact.phone}</a> · <a href={awardsContact.mobileHref} style={{ color: 'var(--text-light)' }}>{awardsContact.mobile}</a></p>
            </div>
            <div style={{ marginTop: '3rem' }}>
              <Link className="btn-gold" to={award ? `/awards/${award.id}` : "/awards"}>Return to Award Details</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nominate-page-container" style={{ padding: '3rem 2rem', background: 'var(--bg-gradient)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div className="nominate-header-card" style={{ maxWidth: '900px', width: '100%', marginBottom: '2rem' }}>
        <Link to={award ? `/awards/${award.id}` : "/awards"} style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', fontWeight: 600 }}>← Back to Award Details</Link>
        <p className="modal-eyebrow" style={{ color: 'var(--gold-primary)', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>MCCIA AWARDS 2026 · CLOSES 15 NOVEMBER</p>
        <h1 className="modal-title" style={{ fontSize: '2.8rem', marginTop: '0.5rem', marginBottom: '0.5rem', lineHeight: 1.2, color: 'var(--accent)' }}>{award ? award.title : 'Nominate your business'}</h1>
        {schema?.subtitle && <p className="modal-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{schema.subtitle}</p>}
        
        {award && (
          <div className="award-preview" style={{ marginTop: '2.5rem', padding: '2rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #ced4da', borderLeft: `6px solid ${award.tagColor}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <span className="award-tag" style={{ background: award.tagColor, color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '1rem' }}>{award.tag}</span>
            <p className="ap-elig" style={{ fontSize: '1rem', color: 'var(--text-light)', lineHeight: 1.6 }}><strong>Eligibility:</strong> {award.eligibility}</p>
            <p className="ap-prize" style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--gold-primary)', fontWeight: 'bold' }}>🏆 {award.prize}</p>
          </div>
        )}
      </div>

      <div className="nominate-form-card" style={{ maxWidth: '900px', width: '100%' }}>
        <div className="glass-card" style={{ padding: '3.5rem', background: '#ffffff', border: '1px solid #ced4da', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <div onKeyDown={onEnter}>
            
            <div className="form-step">
              <h2 className="form-section-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '2px solid #f0f0f0', paddingBottom: '0.5rem' }}>1. Select award</h2>
              <div className="form-group">
                <label htmlFor="award-category" style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Select the award you want to apply for <span aria-hidden="true" style={{color: '#dc3545'}}>*</span></label>
                <select id="award-category" required aria-invalid={Boolean(errors.award)} aria-describedby={errors.award ? 'award-category-error' : undefined} value={awardTitle} onChange={e => { setAwardTitle(e.target.value); clearError('award'); }} style={{ fontSize: '1.1rem', padding: '1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <option value="" style={{ color: '#000000', background: '#ffffff' }}>Choose an award</option>
                  {awardsData.map(a => <option key={a.id} value={a.title} style={{ color: '#000000', background: '#ffffff' }}>{a.title} ({a.tag})</option>)}
                </select>
                {errors.award && <span className="field-error" id="award-category-error" role="alert" style={{ marginTop: '0.5rem', display: 'block' }}>{errors.award}</span>}
              </div>
            </div>

              {schema && (
              <>
                <div className="form-step" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '2px solid #f0f0f0' }}>
                  <h2 className="form-section-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>2. Organisation & contact</h2>
                  {schema.note && <p className="form-help" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>{schema.note}</p>}
                  <p className="form-required-note" style={{ marginBottom: '2rem' }}><span aria-hidden="true" style={{color: '#dc3545'}}>*</span> Required{draft?.values && Object.keys(draft.values).length > 0 && ' · We restored your earlier draft'}</p>
                  {renderGroups(schema.step2)}
                </div>

                <div className="form-step" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '2px solid #f0f0f0' }}>
                  <h2 className="form-section-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>3. Nomination details</h2>
                  {renderGroups(schema.step3)}
                  {schema.file && (
                    <div className="form-group" style={{ marginTop: '2rem' }}>
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
                  <ul className="form-process-note" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <li>Applicants are shortlisted on the information you provide.</li>
                    <li>Shortlisted applicants are asked for catalogues, sales literature, bio-data and photographs.</li>
                    <li>Selected candidates are invited for an interview and presentation.</li>
                    <li>The Selection Committee may request more information or visit your works or factory.</li>
                  </ul>
                  <input className="hp-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={e => setHoneypot(e.target.value)} style={{ display: 'none' }} />
                  <div className="form-group checkbox-group" style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                      <input id="nomination-consent" type="checkbox" checked={agree} aria-invalid={Boolean(errors.agree)} aria-describedby={errors.agree ? 'nomination-consent-error' : undefined} onChange={e => { setAgree(e.target.checked); clearError('agree'); }} style={{ width: 'auto', transform: 'scale(1.2)', margin: 0, cursor: 'pointer' }} />
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent)' }}>I confirm the information provided is accurate and I consent to MCCIA using it for evaluation purposes.</span>
                    </label>
                    {errors.agree && <span className="field-error" id="nomination-consent-error" role="alert" style={{ display: 'block', marginTop: '0.5rem' }}>{errors.agree}</span>}
                  </div>
                  {sendError && <p className="form-send-error" role="alert">{sendError}</p>}
                </div>
              </>
            )}
          </div>

          <div className="modal-actions" style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '2px solid #f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button className="btn-gold" type="button" onClick={submitForm} disabled={sending || !schema} style={{ padding: '1.2rem 4rem', fontSize: '1.3rem', borderRadius: '50px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 8px 20px rgba(212, 163, 55, 0.4)' }}>
              {sending ? 'Submitting…' : 'Submit nomination'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
