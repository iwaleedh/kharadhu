import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, LogOut, UserPlus, KeyRound } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { CreateAccountModal } from './CreateAccountModal';
import { RenameAccountModal } from './RenameAccountModal';
import { PinPromptModal } from '../auth/PinPromptModal';
import { getSecuritySettings } from '../../lib/securitySettings';
import { ChangePinModal } from './ChangePinModal';
import { ForgotPinResetModal } from '../auth/ForgotPinResetModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export const AccountSwitcher = () => {
  const { users, currentUser, init, switchUser, signOut, signUp, renameUser, updatePin, deleteUser, verifyPin, loading, error } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const label = useMemo(() => currentUser?.name || 'Account', [currentUser]);

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete account?"
        message={`Delete account "${currentUser?.name}"? This will permanently remove all its transactions on this device.`}
        confirmText="Delete"
        destructive
        requireText={currentUser?.name || ''}
        requireTextLabel="Type account name"
        requireAcknowledge
        acknowledgeLabel="I understand this will permanently remove this account's data."
        loading={loading}
        onConfirm={async () => {
          if (!currentUser?.id) return;
          await deleteUser({ userId: currentUser.id });
          setConfirmDelete(false);
          setOpen(false);
        }}
      />

      <PinPromptModal
        isOpen={showPinPrompt}
        onClose={() => setShowPinPrompt(false)}
        loading={loading}
        error={error}
        accountName={users.find(u => u.id === targetUserId)?.name}
        onSubmit={async (pin) => {
          if (!targetUserId) return false;
          const ok = await verifyPin({ userId: targetUserId, pin });
          if (ok) {
            await switchUser(targetUserId);
            setShowPinPrompt(false);
            setOpen(false);
          }
          return ok;
        }}
      />

      <CreateAccountModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        loading={loading}
        error={error}
        onCreate={async ({ name, pin }) => {
          const id = await signUp({ name, pin });
          if (id) {
            // signUp already switches to new user
            setShowCreate(false);
            setOpen(false);
            return true;
          }
          return false;
        }}
      />

      <RenameAccountModal
        key={`switcher-rename-${currentUser?.id ?? 'none'}-${showRename ? 'open' : 'closed'}`}
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        initialName={currentUser?.name || ''}
        loading={loading}
        error={error}
        onRename={async (name) => {
          const ok = await renameUser({ userId: currentUser?.id, name });
          if (ok) setOpen(false);
          return ok;
        }}
      />

      <ChangePinModal
        key={`switcher-changepin-${currentUser?.id ?? 'none'}-${showChangePin ? 'open' : 'closed'}`}
        isOpen={showChangePin}
        onClose={() => setShowChangePin(false)}
        loading={loading}
        error={error}
        onChangePin={async (pin) => {
          const ok = await updatePin({ userId: currentUser?.id, pin });
          if (ok) setOpen(false);
          return ok;
        }}
      />

      <ForgotPinResetModal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
        accountName={currentUser?.name}
        loading={loading}
        error={error}
        onResetPinKeepData={async (newPin) => {
          return await updatePin({ userId: currentUser?.id, pin: newPin });
        }}
        onDeleteAccount={async () => {
          if (!currentUser?.id) return false;
          return await deleteUser({ userId: currentUser.id });
        }}
      />

      <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-red-900/30 bg-black/30 text-gray-200 hover:bg-black/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold max-w-[120px] truncate">{label}</span>
        <ChevronDown size={16} className="text-gray-300" />
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border border-red-900/30 bg-black/95 shadow-2xl overflow-hidden"
          role="menu"
        >
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-red-900/20">
            Switch account
          </div>

          <div className="max-h-64 overflow-auto">
            {users.map((u) => (
              <button
                key={u.id}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${
                  currentUser?.id === u.id ? 'bg-white/5 text-white' : 'text-gray-200'
                }`}
                onClick={async () => {
                  const settings = getSecuritySettings();
                  if (settings.requirePinOnSwitch && currentUser?.id !== u.id) {
                    setTargetUserId(u.id);
                    setShowPinPrompt(true);
                    return;
                  }
                  await switchUser(u.id);
                  setOpen(false);
                }}
                role="menuitem"
              >
                {u.name}
              </button>
            ))}
          </div>

          <div className="border-t border-red-900/20">
            <button
              className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5"
              onClick={() => setShowRename(true)}
              role="menuitem"
            >
              Rename account
            </button>

            <button
              className="w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5"
              onClick={() => setShowChangePin(true)}
              role="menuitem"
            >
              Change PIN
            </button>

            <button
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
              onClick={() => setShowForgot(true)}
              role="menuitem"
            >
              <KeyRound size={16} />
              <span>Forgot PIN / Reset</span>
            </button>

            <button
              className="w-full px-3 py-2 text-left text-sm text-coral-400 hover:bg-white/5"
              onClick={() => setConfirmDelete(true)}
              role="menuitem"
            >
              Delete account
            </button>

            <button
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
              onClick={() => {
                // Sign-out returns to Auth screen.
                signOut();
                setOpen(false);
              }}
              role="menuitem"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>

            <button
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
              onClick={() => {
                setShowCreate(true);
              }}
              role="menuitem"
            >
              <UserPlus size={16} />
              <span>Create / Add account</span>
            </button>
          </div>
        </div>
      ) : null}
      </div>
    </>
  );
};
