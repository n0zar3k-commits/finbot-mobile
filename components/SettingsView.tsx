
import React from 'react';
import { User, WorkspaceSettings, AppSettings, Language, Theme } from '../types';
import { User as UserIcon, Bell, Shield, Moon, Sun, Globe } from 'lucide-react';
import { getInitials, roleLabels, t } from '../services/utils';

interface SettingsViewProps {
  user: User;
  workspace: WorkspaceSettings;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, workspace, settings, onUpdateSettings }) => {
  const lang = settings.language;

  const toggleTheme = (theme: Theme) => {
    onUpdateSettings({ ...settings, theme });
  };

  const changeLang = (l: Language) => {
    onUpdateSettings({ ...settings, language: l });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('settings', lang)}</h1>

      {/* User Profile */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <UserIcon size={20} className="text-indigo-500" /> {t('myProfile', lang)}
        </h2>
        
        <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-300 ring-4 ring-white dark:ring-slate-700 shadow-lg">
                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : getInitials(user.name)}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">@{user.username || 'unknown'}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {roleLabels[user.role]}
                </span>
            </div>
        </div>
      </section>

      {/* App Appearance */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Sun size={20} className="text-orange-500" /> {t('theme', lang)} & {t('language', lang)}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">{t('language', lang)}</label>
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                    <button onClick={() => changeLang('ru')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${lang === 'ru' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Русский</button>
                    <button onClick={() => changeLang('en')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500'}`}>English</button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">{t('theme', lang)}</label>
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                    <button onClick={() => toggleTheme('light')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${settings.theme === 'light' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-500'}`}>
                        <Sun size={16} /> {t('light', lang)}
                    </button>
                    <button onClick={() => toggleTheme('dark')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${settings.theme === 'dark' ? 'bg-slate-700 shadow-sm text-indigo-300' : 'text-slate-500'}`}>
                        <Moon size={16} /> {t('dark', lang)}
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
         <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Bell size={20} className="text-indigo-500" /> {t('notifications', lang)}
        </h2>
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('notificationSetting', lang)} {i}</span>
                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${i < 3 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${i < 3 ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default SettingsView;