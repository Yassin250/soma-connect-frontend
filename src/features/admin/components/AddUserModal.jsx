import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { adminService } from '../../../services/api';
import { logicalRect, logicalViewport } from '../../../utils/rootZoom';

const inputClass =
  'w-full rounded-xl bg-[#f7f8fa] border border-[#1b1e26]/10 px-3.5 py-2.5 text-sm text-[#1b1e26] placeholder-gray-400 focus:bg-white focus:border-[#d0f24a] focus:ring-4 focus:ring-[#d0f24a]/20 focus:outline-none transition-all';
const labelClass = 'block text-[10px] font-bold text-[#1b1e26]/45 uppercase tracking-[0.14em] mb-1.5';

/* ── Searchable, multi-select role picker (select2-style, no dependency) ── */
const RoleMultiSelect = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState(null);

  useEffect(() => {
    const onDoc = (e) => {
      const clickedControl = ref.current?.contains(e.target);
      const clickedDropdown = dropdownRef.current?.contains(e.target);
      if (!clickedControl && !clickedDropdown) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const control = ref.current;
      if (!control) return;
      // Physical-px rect → logical (zoomed) space, matching the portal coords.
      const rect = logicalRect(control);
      const viewportHeight = logicalViewport().height;
      const margin = 12;
      const belowSpace = viewportHeight - rect.bottom - margin;
      const aboveSpace = rect.top - margin;
      const openUpward = belowSpace < 260 && aboveSpace > belowSpace;
      const maxHeight = Math.max(160, Math.min(320, openUpward ? aboveSpace - 8 : belowSpace - 8));

      setDropdownStyle({
        width: rect.width,
        left: rect.left,
        top: openUpward ? rect.top - 8 : rect.bottom + 8,
        transform: openUpward ? 'translateY(-100%)' : 'none',
        maxHeight,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const selected = options.filter((o) => value.includes(String(o.id)));
  const filtered = options.filter((o) => (o.name || '').toLowerCase().includes(query.toLowerCase()));
  const toggle = (id) => {
    const s = String(id);
    onChange(value.includes(s) ? value.filter((v) => v !== s) : [...value, s]);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Control */}
      <div
        onClick={() => setOpen((o) => !o)}
        className={`min-h-[44px] w-full rounded-xl bg-[#f7f8fa] border px-2.5 py-2 flex flex-wrap items-center gap-1.5 cursor-pointer transition-all ${
          open ? 'bg-white border-[#d0f24a] ring-4 ring-[#d0f24a]/20' : 'border-[#1b1e26]/10'
        }`}
      >
        {selected.length === 0 && <span className="text-sm text-gray-400 px-1">Select one or more roles…</span>}
        {selected.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1 rounded-lg bg-[#1b1e26] text-white text-[11px] font-semibold pl-2.5 pr-1 py-1">
            {o.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(o.id); }}
              className="w-4 h-4 rounded-md flex items-center justify-center hover:bg-white/20 text-white/70 hover:text-white"
              aria-label={`Remove ${o.name}`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </span>
        ))}
        <svg className={`w-4 h-4 text-[#1b1e26]/40 ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>

      {/* Dropdown (rendered outside modal for proper scroll/visibility) */}
      {open && dropdownStyle && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            left: dropdownStyle.left,
            top: dropdownStyle.top,
            width: dropdownStyle.width,
            transform: dropdownStyle.transform,
            zIndex: 70,
          }}
          className="rounded-xl bg-white border border-[#1b1e26]/10 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="p-2 border-b border-[#1b1e26]/[0.06]">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" /></svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search roles…"
                className="w-full rounded-lg bg-[#f7f8fa] pl-8 pr-3 py-2 text-sm text-[#1b1e26] placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#d0f24a]/40"
              />
            </div>
          </div>
          <div className="overflow-y-auto py-1" style={{ maxHeight: dropdownStyle.maxHeight }}>
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-gray-400">No roles found</p>
            ) : (
              filtered.map((o) => {
                const isSel = value.includes(String(o.id));
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => toggle(o.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#1b1e26] hover:bg-[#d0f24a]/[0.12] transition-colors text-left"
                  >
                    <span className={`w-4 h-4 rounded-[5px] flex items-center justify-center shrink-0 border ${isSel ? 'bg-[#1b1e26] border-[#1b1e26]' : 'border-[#1b1e26]/25'}`}>
                      {isSel && <svg className="w-3 h-3 text-[#d0f24a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </span>
                    <span className="font-medium">{o.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const AddUserModal = ({ isOpen, onClose, onSubmit, editingUser, fetchRoles, fetchEntities }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Active');
  const [roleIds, setRoleIds] = useState([]);
  const [roles, setRoles] = useState([]);
  const [entityId, setEntityId] = useState('');
  const [entities, setEntities] = useState([]);

  const isEditMode = !!editingUser;

  const entityRoles = ['ENTITY_ADMIN', 'STUDENT'];
  const showEntitySelect = fetchEntities && roleIds.some((rid) => {
    const r = roles.find((rr) => String(rr.id) === rid);
    return r && entityRoles.includes(r.name);
  });

  // Resolve the editingUser's current role ids to an array of strings, regardless
  // of the shape the backend returned roles in.
  const resolveRoleIds = (user, roleList) => {
    if (!user) return [];
    const out = new Set();
    const addByName = (n) => {
      const m = roleList.find((r) => r.name === n);
      if (m) out.add(String(m.id));
    };
    if (Array.isArray(user.roles)) {
      user.roles.forEach((r) => {
        if (r && typeof r === 'object' && r.id != null) out.add(String(r.id));
        else if (typeof r === 'string') addByName(r);
        else if (r != null) out.add(String(r));
      });
    }
    if (user.roleId != null) out.add(String(user.roleId));
    if (user.role && typeof user.role === 'object' && user.role.id != null) out.add(String(user.role.id));
    if (user.roleName) addByName(user.roleName);
    return [...out];
  };

  // Load roles when the modal opens (via apiClient → auth + refresh handling).
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await (fetchRoles ? fetchRoles() : adminService.getRoles());
        if (cancelled) return;
        const roleList = Array.isArray(data) ? data : [];
        setRoles(roleList);
        if (editingUser) setRoleIds(resolveRoleIds(editingUser, roleList));
      } catch (err) {
        if (!cancelled) console.error('Error fetching roles:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, editingUser, fetchRoles]);

  // Load entities when the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await (fetchEntities ? fetchEntities() : []);
        if (cancelled) return;
        setEntities(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) console.error('Error fetching entities:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, fetchEntities]);

  // Populate / reset fields when opening.
  useEffect(() => {
    if (!isOpen) return;
    if (editingUser) {
      setName(editingUser.name || '');
      setUsername(editingUser.username || '');
      setEmail(editingUser.email || '');
      setStatus(editingUser.status || 'Active');
      setPassword('');
      setRoleIds(resolveRoleIds(editingUser, roles));
    } else {
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setStatus('Active'); // new users are always created Active
      setRoleIds([]);
      setEntityId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingUser, isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    // Backdrop — clicking outside the card closes the modal.
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1b1e26]/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[600px] max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-[#1b1e26]/[0.06] shadow-[0_20px_60px_rgba(27,30,38,0.25)] p-6 sm:p-8 animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[#1b1e26]/40 hover:text-[#1b1e26] hover:bg-[#f3f4f6] transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
        </button>

        {/* Header */}
        <div className="mb-6 pr-8">
          <span className="w-11 h-11 rounded-2xl bg-[#d0f24a]/25 text-[#1b1e26] flex items-center justify-center mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6" />
            </svg>
          </span>
          <h3 className="text-xl font-semibold text-[#1b1e26] tracking-tight">
            {isEditMode ? 'Update user' : 'Add new user'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? 'Modify this account, its status, and assigned roles.' : 'Create an account and assign one or more roles.'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ name, username, email, password, status, roleIds, entityId: entityId || undefined });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ganza Kenny" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. gkenny" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. g.kenny@somaconnect.rw" className={inputClass} />
          </div>

          {!isEditMode && (
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} />
            </div>
          )}

          {/* Status only shown when editing — new users are always Active */}
          {isEditMode && (
            <div>
              <label className={labelClass}>Account Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Roles</label>
            <RoleMultiSelect options={roles} value={roleIds} onChange={setRoleIds} />
          </div>

          {showEntitySelect && (
            <div>
              <label className={labelClass}>Entity</label>
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className={`${inputClass} cursor-pointer`}
                required
              >
                <option value="">Select an entity…</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1b1e26]/70 border border-[#1b1e26]/10 hover:bg-[#f3f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#d0f24a] text-[#1b1e26] hover:bg-[#c4e83a] transition-colors active:scale-[0.98] shadow-sm"
            >
              {isEditMode ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddUserModal;
