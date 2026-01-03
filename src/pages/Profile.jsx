import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, LogOut, UserPlus, KeyRound, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { CreateAccountModal } from '../components/layout/CreateAccountModal';
import { RenameAccountModal } from '../components/layout/RenameAccountModal';
import { ChangePinModal } from '../components/layout/ChangePinModal';
import { ForgotPinResetModal } from '../components/auth/ForgotPinResetModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { cn } from '../lib/utils';

export const Profile = () => {
  const { users, currentUser, init, switchUser, signOut, signUp, renameUser, updatePin, deleteUser, loading, error } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="space-y-3 pb-4">
      {/* Modals */}
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
            setShowCreate(false);
            return true;
          }
          return false;
        }}
      />

      <RenameAccountModal
        key={`rename-${currentUser?.id ?? 'none'}-${showRename ? 'open' : 'closed'}`}
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        initialName={currentUser?.name || ''}
        loading={loading}
        error={error}
        onRename={async (name) => {
          const ok = await renameUser({ userId: currentUser?.id, name });
          if (ok) setShowRename(false);
          return ok;
        }}
      />

      <ChangePinModal
        key={`changepin-${currentUser?.id ?? 'none'}-${showChangePin ? 'open' : 'closed'}`}
        isOpen={showChangePin}
        onClose={() => setShowChangePin(false)}
        loading={loading}
        error={error}
        onChangePin={async (pin) => {
          const ok = await updatePin({ userId: currentUser?.id, pin });
          if (ok) setShowChangePin(false);
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

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-100">
          <span className="dhivehi">ޕްރޮފައިލް</span> <span className="text-base text-gray-300">Profile</span>
        </h2>
        <p className="text-sm text-gray-400"><span className="dhivehi">އެކައުންޓް ބެލެހެއްޓުން</span></p>
      </div>

      {/* Current Account Info */}
      <Card className="bg-gradient-to-br from-red-950/30 to-red-900/20 border-red-900/50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User size={20} className="text-red-400" />
            <CardTitle className="text-gray-100">Current Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-base text-gray-300">Name</span>
              <span className="text-lg font-semibold text-white">{currentUser?.name || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-red-900/30">
              <span className="text-base text-gray-300">Account ID</span>
              <span className="text-base font-mono text-gray-400">#{currentUser?.id || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-red-900/30">
              <span className="text-base text-gray-300">Created</span>
              <span className="text-sm text-gray-400">
                {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="dhivehi">އެކައުންޓް އެކްޝަންސް</span> <span className="text-base text-gray-300">Account Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="secondary"
              onClick={() => setShowRename(true)}
              className="w-full flex items-center justify-start space-x-3"
            >
              <Edit2 size={18} />
              <span>Rename Account</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowChangePin(true)}
              className="w-full flex items-center justify-start space-x-3"
            >
              <KeyRound size={18} />
              <span>Change PIN</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowForgot(true)}
              className="w-full flex items-center justify-start space-x-3"
            >
              <KeyRound size={18} />
              <span>Forgot PIN / Reset</span>
            </Button>

            <Button
              variant="danger"
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-start space-x-3"
            >
              <Trash2 size={18} />
              <span>Delete Account</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Switch Account */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="dhivehi">އެކައުންޓް ބަދަލުކުރުން</span> <span className="text-base text-gray-300">Switch Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 1 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => switchUser(user.id)}
                  className={cn(
                    'w-full p-3 rounded-lg border transition-all duration-300 flex items-center justify-between',
                    currentUser?.id === user.id
                      ? 'bg-red-950/50 border-red-900/50 text-white'
                      : 'bg-black/30 border-gray-800 text-gray-300 hover:bg-black/40 hover:border-gray-700'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'p-2 rounded-full',
                      currentUser?.id === user.id ? 'bg-red-600' : 'bg-gray-700'
                    )}>
                      <User size={16} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">ID: #{user.id}</p>
                    </div>
                  </div>
                  {currentUser?.id === user.id && (
                    <span className="text-xs bg-red-600 px-2 py-1 rounded-full text-white font-semibold">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No other accounts available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create New Account */}
      <Card>
        <CardContent className="pt-4">
          <Button
            variant="outline"
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center space-x-3"
          >
            <UserPlus size={18} />
            <span>Create / Add Account</span>
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-4">
          <Button
            variant="danger"
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-3"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
