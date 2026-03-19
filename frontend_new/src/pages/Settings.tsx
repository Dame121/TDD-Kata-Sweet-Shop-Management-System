import { useState } from 'react';
import { Button, Card, Label } from '@/components/Ui';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormData {
  displayName: string;
  email: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    displayName: 'John Doe',
    email: 'john@example.com',
    theme: 'light',
    notifications: true,
    language: 'en',
  });

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setMessage({
      type: 'success',
      text: 'Settings saved successfully!',
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({
      type: 'success',
      text: 'Password changed successfully!',
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Account Settings */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Account Settings
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <Label htmlFor="displayName" required>
                Display Name
              </Label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <Label htmlFor="email" required>
                Email Address
              </Label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="notifications"
                name="notifications"
                type="checkbox"
                checked={formData.notifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="notifications"
                className="ml-2 block text-sm text-gray-700"
              >
                Enable email notifications
              </label>
            </div>

            <div className="flex gap-4">
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password */}
        <Card>
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Change Password
            </h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <Label htmlFor="currentPassword" required>
                Current Password
              </Label>
              <input
                id="currentPassword"
                type="password"
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" required>
                New Password
              </Label>
              <input
                id="newPassword"
                type="password"
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>
                Confirm Password
              </Label>
              <input
                id="confirmPassword"
                type="password"
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
