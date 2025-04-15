import { useState, useEffect } from 'react';
import { 
  getUserPaymentPreferences,
  updatePaymentPreferences,
  addSavedPaymentMethod,
  removeSavedPaymentMethod,
  setDefaultPaymentMethod,
  addFamilyProfile,
  updateFamilyProfile,
  removeFamilyProfile,
  SavedPaymentMethod,
  PaymentPreferences as PaymentPreferencesType,
  FamilyProfile
} from '@/lib/api';

interface PaymentPreferencesProps {
  onClose?: () => void;
}

export default function PaymentPreferences({ onClose }: PaymentPreferencesProps) {
  const [preferences, setPreferences] = useState<PaymentPreferencesType | null>(null);
  const [activeTab, setActiveTab] = useState<'methods' | 'family' | 'recurring'>('methods');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);

  const [recurringForm, setRecurringForm] = useState({
    enabled: false,
    amount: 0,
    frequency: 'monthly' as ('weekly' | 'monthly'),
    minBalance: 0
  });

  const [newProfileForm, setNewProfileForm] = useState({
    name: '',
    email: '',
    relationship: '',
    monthlyLimit: 0
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await getUserPaymentPreferences();
      setPreferences(response.data);
      if (response.data.recurringTopUp) {
        setRecurringForm(response.data.recurringTopUp);
      }
    } catch (err) {
      setError('Failed to load payment preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultMethod = async (methodId: string) => {
    try {
      await setDefaultPaymentMethod(methodId);
      loadPreferences();
    } catch (err) {
      setError('Failed to set default payment method');
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    try {
      await removeSavedPaymentMethod(methodId);
      loadPreferences();
    } catch (err) {
      setError('Failed to remove payment method');
    }
  };

  const handleUpdateRecurring = async () => {
    try {
      await updatePaymentPreferences({
        recurringTopUp: recurringForm
      });
      loadPreferences();
    } catch (err) {
      setError('Failed to update recurring top-up settings');
    }
  };

  const handleAddFamilyProfile = async () => {
    try {
      await addFamilyProfile({
        ...newProfileForm,
        paymentMethods: [],
        isActive: true
      });
      setNewProfileForm({
        name: '',
        email: '',
        relationship: '',
        monthlyLimit: 0
      });
      loadPreferences();
    } catch (err) {
      setError('Failed to add family profile');
    }
  };

  const handleUpdateProfile = async (profileId: string, updates: Partial<FamilyProfile>) => {
    try {
      await updateFamilyProfile(profileId, updates);
      loadPreferences();
      setEditingProfile(null);
    } catch (err) {
      setError('Failed to update family profile');
    }
  };

  const handleRemoveProfile = async (profileId: string) => {
    try {
      await removeFamilyProfile(profileId);
      loadPreferences();
    } catch (err) {
      setError('Failed to remove family profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Payment Preferences</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'methods'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500'
            }`}
          >
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'recurring'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500'
            }`}
          >
            Recurring Top-up
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'family'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500'
            }`}
          >
            Family Profiles
          </button>
        </div>

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && preferences && (
          <div className="space-y-4">
            {preferences.savedMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border ${
                  method.isDefault ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {method.type === 'card' ? '💳' : '👝'}
                    </span>
                    <div>
                      <p className="font-medium">
                        {method.type === 'card'
                          ? `${method.details.cardType} ****${method.details.last4}`
                          : 'E-Wallet'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {method.type === 'card' && `Expires: ${method.details.expiryDate}`}
                        Last used: {new Date(method.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefaultMethod(method.id)}
                        className="px-3 py-1 text-sm border border-primary-500 text-primary-600 rounded hover:bg-primary-50"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMethod(method.id)}
                      className="px-3 py-1 text-sm border border-red-500 text-red-600 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recurring Top-up Tab */}
        {activeTab === 'recurring' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="enable-recurring"
                checked={recurringForm.enabled}
                onChange={(e) =>
                  setRecurringForm((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="h-4 w-4 text-primary-600 rounded border-gray-300"
              />
              <label htmlFor="enable-recurring" className="text-gray-700">
                Enable Automatic Top-up
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Top-up
                </label>
                <input
                  type="number"
                  value={recurringForm.amount}
                  onChange={(e) =>
                    setRecurringForm((prev) => ({
                      ...prev,
                      amount: Number(e.target.value)
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  disabled={!recurringForm.enabled}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={recurringForm.frequency}
                  onChange={(e) =>
                    setRecurringForm((prev) => ({
                      ...prev,
                      frequency: e.target.value as 'weekly' | 'monthly'
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  disabled={!recurringForm.enabled}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Balance Trigger
                </label>
                <input
                  type="number"
                  value={recurringForm.minBalance}
                  onChange={(e) =>
                    setRecurringForm((prev) => ({
                      ...prev,
                      minBalance: Number(e.target.value)
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  disabled={!recurringForm.enabled}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Auto top-up when balance falls below this amount
                </p>
              </div>

              <button
                onClick={handleUpdateRecurring}
                disabled={!recurringForm.enabled}
                className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                Save Auto Top-up Settings
              </button>
            </div>
          </div>
        )}

        {/* Family Profiles Tab */}
        {activeTab === 'family' && preferences && (
          <div className="space-y-6">
            {/* Existing Profiles */}
            {preferences.familyProfiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 rounded-lg border border-gray-200"
              >
                {editingProfile?.id === profile.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editingProfile.name}
                      onChange={(e) =>
                        setEditingProfile((prev) =>
                          prev ? { ...prev, name: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      value={editingProfile.email}
                      onChange={(e) =>
                        setEditingProfile((prev) =>
                          prev ? { ...prev, email: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={editingProfile.relationship}
                      onChange={(e) =>
                        setEditingProfile((prev) =>
                          prev ? { ...prev, relationship: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Relationship"
                    />
                    <input
                      type="number"
                      value={editingProfile.monthlyLimit || 0}
                      onChange={(e) =>
                        setEditingProfile((prev) =>
                          prev ? { ...prev, monthlyLimit: Number(e.target.value) } : null
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Monthly Limit"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          editingProfile &&
                          handleUpdateProfile(editingProfile.id, editingProfile)
                        }
                        className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProfile(null)}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-sm text-gray-500">{profile.email}</p>
                      <p className="text-sm text-gray-500">
                        {profile.relationship}
                        {profile.monthlyLimit &&
                          ` • Limit: $${profile.monthlyLimit}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProfile(profile)}
                        className="px-3 py-1 text-sm border border-primary-500 text-primary-600 rounded hover:bg-primary-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveProfile(profile.id)}
                        className="px-3 py-1 text-sm border border-red-500 text-red-600 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add New Profile Form */}
            <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Add Family Member</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newProfileForm.name}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={newProfileForm.email}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={newProfileForm.relationship}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({
                      ...prev,
                      relationship: e.target.value
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Relationship (e.g., Child, Parent)"
                />
                <input
                  type="number"
                  value={newProfileForm.monthlyLimit}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({
                      ...prev,
                      monthlyLimit: Number(e.target.value)
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Monthly Spending Limit (optional)"
                />
                <button
                  onClick={handleAddFamilyProfile}
                  className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Add Family Member
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}