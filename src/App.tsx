import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import sidebarLogo from './assets/new-sidebar-logo.png';

// --- Habit Types & Definitions ---
export type HabitKey =
  | 'sleep'
  | 'physicalActivity'
  | 'water'
  | 'fruitsVeg'
  | 'wholeFoods'
  | 'upf'
  | 'sugaryDrinks'
  | 'mood';

export interface HabitConfig {
  key: HabitKey;
  label: string;
  icon: string;
  selections: number[];
  selectionLabels?: Record<number, string>;
  goal: string;
}

interface DailyEntry {
  date: string; // YYYY-MM-DD
  sleep?: number;
  physicalActivity?: number;
  water?: number;
  fruitsVeg?: number;
  wholeFoods?: number;
  upf?: number;
  sugaryDrinks?: number;
  mood?: number;
}

interface UserData {
  role: 'Teacher' | 'Student';
  grade?: 'K - 5th' | '6th - 8th' | '9th - 12th' | '';
  classroomCode: string;
  entries: Record<string, DailyEntry>;
}

export default function App() {
  // Navigation & Auth State
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'classroom' | 'home' | 'log' | 'view' | 'learning' | 'resources' | 'survey'>('login');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Form Inputs - Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form Inputs - Registration
  const [regRole, setRegRole] = useState<'Teacher' | 'Student' | ''>('');
  const [regGrade, setRegGrade] = useState<'K - 5th' | '6th - 8th' | '9th - 12th' | ''>('');
  const [regUsername, setRegUsername] = useState('');
  const [regClassroomCode, setRegClassroomCode] = useState('');

  // Registration Validation Errors
  const [regFormatError, setRegFormatError] = useState(false);
  const [regTakenError, setRegTakenError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const [gradeError, setGradeError] = useState(false);
  const [codeEmptyError, setCodeEmptyError] = useState(false);
  const [codeCustomError, setCodeCustomError] = useState('');
  const [generalRegError, setGeneralRegError] = useState(false);

  // Log Data Inputs State
  const [logFormValues, setLogFormValues] = useState<Record<HabitKey, number>>({
    sleep: 0,
    physicalActivity: 0,
    water: 0,
    fruitsVeg: 0,
    wholeFoods: 0,
    upf: 0,
    sugaryDrinks: 0,
    mood: 1,
  });
  const [logSuccessMsg, setLogSuccessMsg] = useState('');

  // View Data State
  const [selectedCategory, setSelectedCategory] = useState<HabitKey>('sleep');

  // Survey Form State
  const [surveyStudentHardestHabit, setSurveyStudentHardestHabit] = useState('');
  const [surveyStudentMoreTips, setSurveyStudentMoreTips] = useState('');
  const [surveySuccessMsg, setSurveySuccessMsg] = useState('');

  // Database stored in LocalStorage
  const [usersDb, setUsersDb] = useState<Record<string, UserData>>({});

  useEffect(() => {
    const saved = localStorage.getItem('healthy_habits_users');
    if (saved) {
      try {
        setUsersDb(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local storage', e);
      }
    }
  }, []);

  const saveDb = (updatedDb: Record<string, UserData>) => {
    setUsersDb(updatedDb);
    localStorage.setItem('healthy_habits_users', JSON.stringify(updatedDb));
  };

  // Helper: Get EST ISO Date String (YYYY-MM-DD)
  const getTodayESTISO = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  };

  // Helper: Get EST Formatted Date String (MM/DD/YYYY)
  const getTodayESTFormatted = (): string => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).formatToParts(now);
    let mm = '', dd = '', yyyy = '';
    for (const p of parts) {
      if (p.type === 'month') mm = p.value;
      if (p.type === 'day') dd = p.value;
      if (p.type === 'year') yyyy = p.value;
    }
    return `${mm}/${dd}/${yyyy}`;
  };

  // Helper: Convert YYYY-MM-DD to MM/DD/YYYY
  const formatDateToMDY = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
  };

  // Helper: Get Grade for Current User
  const getCurrentUserGrade = (): string => {
    if (!currentUser || !usersDb[currentUser]) return 'N/A';
    const user = usersDb[currentUser];
    if (user.role === 'Teacher' && user.grade) {
      return user.grade;
    }
    const userCode = (user.classroomCode || '').trim().toLowerCase();
    const teacher = Object.values(usersDb).find(
      (u) => u.role === 'Teacher' && (u.classroomCode || '').trim().toLowerCase() === userCode
    );
    return teacher?.grade || user.grade || 'N/A';
  };

  // Helper: Get Role for Current User
  const getCurrentUserRole = (): 'Teacher' | 'Student' | 'N/A' => {
    if (!currentUser || !usersDb[currentUser]) return 'N/A';
    return usersDb[currentUser].role || 'N/A';
  };

  // Helper: Get Classroom Code for Current User
  const getCurrentUserClassroomCode = (): string => {
    if (!currentUser || !usersDb[currentUser]) return 'N/A';
    return usersDb[currentUser].classroomCode || 'N/A';
  };

  // Grade-adaptive Habit Configurations
  const getHabitsConfig = (grade: string): HabitConfig[] => {
    if (grade === 'K - 5th') {
      return [
        { key: 'sleep', label: 'Sleep', icon: '🛌', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], selectionLabels: { 12: '12+' }, goal: '9 - 12 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], selectionLabels: { 9: '9+' }, goal: '6 - 9 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80%+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40%+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🧃', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 drinks / day' },
        { key: 'mood', label: 'Mood', icon: '⭐', selections: [1, 2, 3], goal: '3 stars' },
      ];
    } else if (grade === '6th - 8th') {
      return [
        { key: 'sleep', label: 'Sleep', icon: '🛌', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], selectionLabels: { 10: '10+' }, goal: '8 - 10 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], selectionLabels: { 11: '11+' }, goal: '8 - 11 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80%+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40%+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🧃', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 - 1 drinks / day' },
        { key: 'mood', label: 'Mood', icon: '⭐', selections: [1, 2, 3], goal: '3 stars' },
      ];
    } else {
      return [
        { key: 'sleep', label: 'Sleep', icon: '🛌', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], selectionLabels: { 10: '10+' }, goal: '8 - 10 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], selectionLabels: { 13: '13+' }, goal: '9 - 13 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80%+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40%+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🧃', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 - 1 drinks / day' },
        { key: 'mood', label: 'Mood', icon: '⭐', selections: [1, 2, 3], goal: '3 stars' },
      ];
    }
  };

  const getHabitColor = (key: HabitKey, val: number, grade: string): 'red' | 'yellow' | 'green' => {
    if (key === 'sugaryDrinks') {
      return val === 0 ? 'green' : val === 1 ? 'yellow' : 'red';
    }
    if (grade === 'K - 5th') {
      switch (key) {
        case 'sleep': return val >= 9 ? 'green' : val === 8 ? 'yellow' : 'red';
        case 'physicalActivity': return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water': return val >= 6 ? 'green' : val === 5 ? 'yellow' : 'red';
        case 'fruitsVeg': return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods': return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf': return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'mood': return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
        default: return 'green';
      }
    } else if (grade === '6th - 8th') {
      switch (key) {
        case 'sleep': return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'physicalActivity': return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water': return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'fruitsVeg': return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods': return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf': return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'mood': return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
        default: return 'green';
      }
    } else {
      switch (key) {
        case 'sleep': return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'physicalActivity': return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water': return val >= 9 ? 'green' : val === 8 ? 'yellow' : 'red';
        case 'fruitsVeg': return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods': return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf': return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'mood': return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
        default: return 'green';
      }
    }
  };

  useEffect(() => {
    if (!currentUser || !usersDb[currentUser]) return;
    const todayISO = getTodayESTISO();
    const userEntries = usersDb[currentUser].entries || {};
    const todayEntry = userEntries[todayISO];
    const userGrade = getCurrentUserGrade();
    const currentHabitsConfig = getHabitsConfig(userGrade);

    if (todayEntry) {
      const populatedValues: Record<HabitKey, number> = { ...logFormValues };
      currentHabitsConfig.forEach((h) => {
        if (todayEntry[h.key] !== undefined) {
          populatedValues[h.key] = todayEntry[h.key]!;
        } else {
          populatedValues[h.key] = h.selections[0];
        }
      });
      setLogFormValues(populatedValues);
    } else {
      const defaultValues: Record<HabitKey, number> = { ...logFormValues };
      currentHabitsConfig.forEach((h) => {
        defaultValues[h.key] = h.selections[0];
      });
      setLogFormValues(defaultValues);
    }
  }, [currentUser, currentPage, usersDb]);

  // --- Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (loginUsername || '').trim();
    if (usersDb[trimmed]) {
      setCurrentUser(trimmed);
      setLoginError('');
      setLoginUsername('');
      setCurrentPage('classroom');
    } else {
      setLoginError('The username you entered has not yet been registered. Try another username or register.');
      setLoginUsername('');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = (regUsername || '').trim();
    const trimmedCode = (regClassroomCode || '').trim();

    setRegFormatError(false);
    setRegTakenError(false);
    setRoleError(false);
    setGradeError(false);
    setCodeEmptyError(false);
    setCodeCustomError('');
    setGeneralRegError(false);

    let hasError = false;

    if (!regRole) {
      setRoleError(true);
      hasError = true;
    }
    if (regRole === 'Teacher' && !regGrade) {
      setGradeError(true);
      hasError = true;
    }

    const isAlphanumeric = /^[a-zA-Z0-9]{6,12}$/.test(trimmedUser);
    if (!trimmedUser || !isAlphanumeric) {
      setRegFormatError(true);
      hasError = true;
    }
    if (usersDb[trimmedUser]) {
      setRegTakenError(true);
      hasError = true;
    }
    if (!trimmedCode) {
      setCodeEmptyError(true);
      hasError = true;
    } else {
      if (regRole === 'Teacher') {
        const existingCodeTeacher = Object.values(usersDb).some(
          (u) => (u.classroomCode || '').trim().toLowerCase() === trimmedCode.toLowerCase()
        );
        if (existingCodeTeacher) {
          setCodeCustomError('That classroom code has already been registered. Please select a different classroom code.');
          hasError = true;
        }
      } else if (regRole === 'Student') {
        const teacherWithCode = Object.values(usersDb).find(
          (u) => u.role === 'Teacher' && (u.classroomCode || '').trim().toLowerCase() === trimmedCode.toLowerCase()
        );
        if (!teacherWithCode) {
          setCodeCustomError('Please re-enter your classroom code or check with your teacher. The classroom code indicated has not yet been registered and is not currently associated with a teacher’s classroom.');
          hasError = true;
        }
      }
    }

    if (hasError) {
      setGeneralRegError(true);
      return;
    }

    const newUser: UserData = {
      role: regRole as 'Teacher' | 'Student',
      grade: regRole === 'Teacher' ? regGrade : '',
      classroomCode: trimmedCode,
      entries: {}
    };

    const updated = {
      ...usersDb,
      [trimmedUser]: newUser
    };

    saveDb(updated);
    setCurrentUser(trimmedUser);
    setRegUsername('');
    setRegRole('');
    setRegGrade('');
    setRegClassroomCode('');
    setCurrentPage('classroom');
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const todayISO = getTodayESTISO();
    const user = usersDb[currentUser];
    const todayEntry: DailyEntry = { date: todayISO, ...logFormValues };
    const newEntries = { ...(user.entries || {}), [todayISO]: todayEntry };
    const sortedKeys = Object.keys(newEntries).sort();
    if (sortedKeys.length > 28) {
      const keysToRemove = sortedKeys.slice(0, sortedKeys.length - 28);
      keysToRemove.forEach((k) => delete newEntries[k]);
    }
    const updatedDb = {
      ...usersDb,
      [currentUser]: { ...user, entries: newEntries }
    };
    saveDb(updatedDb);
    setLogSuccessMsg('Data logged successfully!');
    setTimeout(() => setLogSuccessMsg(''), 3000);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveySuccessMsg('Thank you! Your survey responses have been submitted.');
    setTimeout(() => setSurveySuccessMsg(''), 4000);
  };

  // --- Calculation Helpers ---
  const getUserEntries = (): DailyEntry[] => {
    if (!currentUser || !usersDb[currentUser]) return [];
    const entriesObj = usersDb[currentUser].entries || {};
    return Object.values(entriesObj).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getWeeklyAverage = (key: HabitKey): number => {
    const entries = getUserEntries();
    if (entries.length === 0) return 0;
    const last7 = entries.slice(-7);
    const validValues = last7.map((e) => e[key]).filter((v): v is number => v !== undefined);
    if (validValues.length === 0) return 0;
    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / validValues.length);
  };

  const getClassroomWeeklyAverage = (key: HabitKey): number => {
    const code = getCurrentUserClassroomCode().trim().toLowerCase();
    if (code === 'n/a') return 0;
    const classroomStudents = Object.values(usersDb).filter(
      (u) => u.role === 'Student' && (u.classroomCode || '').trim().toLowerCase() === code
    );
    if (classroomStudents.length === 0) return 0;
    let studentAveragesSum = 0;
    let countedStudents = 0;
    classroomStudents.forEach((st) => {
      const entries = Object.values(st.entries || {}).sort((a, b) => a.date.localeCompare(b.date));
      if (entries.length > 0) {
        const last7 = entries.slice(-7);
        const validValues = last7.map((e) => e[key]).filter((v): v is number => v !== undefined);
        if (validValues.length > 0) {
          const stSum = validValues.reduce((acc, curr) => acc + curr, 0);
          studentAveragesSum += stSum / validValues.length;
          countedStudents++;
        }
      }
    });
    if (countedStudents === 0) return 0;
    const avg = studentAveragesSum / countedStudents;
    return Math.round(avg);
  };

  const get28DayGrid = () => {
    const result: { dateStr: string; entry?: DailyEntry }[] = [];
    const todayESTStr = getTodayESTISO();
    const [yyyy, mm, dd] = todayESTStr.split('-').map(Number);
    const todayESTDate = new Date(yyyy, mm - 1, dd);
    for (let i = 27; i >= 0; i--) {
      const d = new Date(todayESTDate);
      d.setDate(d.getDate() - i);
      const isoY = d.getFullYear();
      const isoM = String(d.getMonth() + 1).padStart(2, '0');
      const isoD = String(d.getDate()).padStart(2, '0');
      const iso = `${isoY}-${isoM}-${isoD}`;
      const entry = currentUser && usersDb[currentUser] && usersDb[currentUser].entries ? usersDb[currentUser].entries[iso] : undefined;
      result.push({ dateStr: iso, entry });
    }
    return result;
  };

  const renderStatusIcon = (key: HabitKey, avg: number, grade: string) => {
    const status = getHabitColor(key, avg, grade);
    if (status === 'green') return <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>;
    if (status === 'yellow') return <span style={{ color: '#D4AC0D', fontWeight: 'bold', fontSize: '1.4em', lineHeight: '1' }}>●</span>;
    return <span style={{ color: 'red', fontWeight: 'bold' }}>✕</span>;
  };

  // --- Theme Colors & Fonts ---
  const steelBlue = '#3E6F9B';
  const cream = '#FCFAF5';
  const charBlack = '#202124';
  const manropeFont = "'Manrope', sans-serif";

  const styles: Record<string, React.CSSProperties> = {
    appContainer: {
      fontFamily: manropeFont,
      backgroundColor: cream,
      color: charBlack,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    centerHeader: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    mainLogoImage: {
      maxWidth: '440px',
      maxHeight: '280px',
      objectFit: 'contain',
      margin: '15px auto',
      display: 'block'
    },
    authContainer: {
      width: '420px',
      margin: '0 auto',
      textAlign: 'left'
    },
    sectionHeadingBlue: {
      fontFamily: manropeFont,
      fontSize: '18px',
      fontWeight: 'bold',
      color: steelBlue,
      marginTop: '25px',
      marginBottom: '6px'
    },
    inputBox: {
      width: '100%',
      padding: '10px',
      margin: '6px 0',
      fontFamily: manropeFont,
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      backgroundColor: steelBlue,
      color: '#FFFFFF',
      border: 'none',
      padding: '10px',
      fontFamily: manropeFont,
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: '15px'
    },
    linkText: {
      marginTop: '15px',
      color: charBlack,
      fontFamily: manropeFont,
      fontSize: '14px'
    },
    linkAnchor: {
      color: steelBlue,
      cursor: 'pointer',
      textDecoration: 'underline',
      fontFamily: manropeFont
    },
    dashboardLayout: {
      display: 'flex',
      flex: 1,
      minHeight: '100vh'
    },
    sidebar: {
      width: '260px',
      backgroundColor: steelBlue,
      color: '#FFFFFF',
      padding: '20px 15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      boxSizing: 'border-box',
    },
    sidebarLogoBox: {
      width: '100%',
      maxWidth: '220px',
      backgroundColor: 'transparent',
      padding: '6px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '8px',
      boxSizing: 'border-box',
    },
    sidebarLogoImage: {
      width: '200%',
      maxWidth: 'none',
      height: 'auto',
      maxHeight: '160px',
      objectFit: 'contain',
      display: 'block',
    },
    navButton: {
      width: '100%',
      maxWidth: '220px',
      backgroundColor: cream,
      color: charBlack,
      border: '1px solid transparent',
      padding: '11px 12px',
      cursor: 'pointer',
      fontFamily: manropeFont,
      fontSize: '14px',
      fontWeight: 600,
      textAlign: 'center',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease-in-out'
    },
    activeNavButton: {
      backgroundColor: '#EAE5D9',
      color: steelBlue,
      border: `2px solid ${steelBlue}`,
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
    },
    mainContent: {
      flex: 1,
      backgroundColor: cream,
      padding: '30px',
      color: charBlack
    },
    gridTable: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '8px',
      marginTop: '20px'
    },
    gridCell: {
      border: '1px solid #ccc',
      padding: '10px 5px',
      textAlign: 'center',
      borderRadius: '4px',
      minHeight: '60px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      fontSize: '13px',
      fontFamily: manropeFont
    },
    logTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px',
      textAlign: 'left'
    },
    logTableCell: {
      padding: '10px 12px',
      textAlign: 'left',
      fontFamily: manropeFont,
      color: charBlack,
      fontSize: '15px'
    },
    logTableHeaderCell: {
      padding: '10px 12px',
      textAlign: 'left',
      fontFamily: manropeFont,
      color: steelBlue,
      fontWeight: 'bold',
      fontSize: '16px'
    },
    resourceIndentLink: {
      display: 'block',
      marginLeft: '20px',
      color: steelBlue,
      textDecoration: 'underline',
      marginBottom: '6px',
      fontSize: '14px',
      fontFamily: manropeFont
    },
    smallContentHeader: {
      fontSize: '15px',
      fontWeight: 'bold',
      margin: '6px 0 3px 0'
    },
    smallContentText: {
      fontSize: '14px',
      margin: '0 0 8px 0',
      lineHeight: '1.5'
    },
    pageTopRightInfo: {
      fontSize: 'smaller',
      textAlign: 'right' as const,
      marginBottom: '15px',
      fontFamily: manropeFont,
      color: charBlack
    },
    statusItemLabel: {
      fontWeight: 'bold'
    },
    halfHeightSpace: {
      height: '10px'
    }
  };

  // --- LOGIN PAGE ---
  if (currentPage === 'login') {
    return (
      <div style={styles.appContainer}>
        <div style={{ padding: '40px 20px' }}>
          <div style={styles.centerHeader}>
            <img src={logo} alt="HealthyHabitsED Logo" style={styles.mainLogoImage} />
          </div>
          <div style={styles.authContainer}>
            <h2 style={{ color: charBlack, marginBottom: '5px', fontFamily: manropeFont }}>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                style={styles.inputBox}
              />
              {loginError && (
                <div style={{ color: 'red', fontSize: '13px', marginTop: '4px', fontFamily: manropeFont }}>
                  {loginError}
                </div>
              )}
              <button type="submit" style={styles.button}>
                Login
              </button>
            </form>
            <div style={styles.linkText}>
              Don’t have an account?{' '}
              <span
                style={styles.linkAnchor}
                onClick={() => {
                  setLoginError('');
                  setCurrentPage('register');
                }}
              >
                Register now.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- REGISTRATION PAGE ---
  if (currentPage === 'register') {
    return (
      <div style={styles.appContainer}>
        <div style={{ padding: '40px 20px' }}>
          <div style={styles.centerHeader}>
            <img src={logo} alt="HealthyHabitsED Logo" style={styles.mainLogoImage} />
          </div>
          <div style={styles.authContainer}>
            <h2 style={{ color: charBlack, marginBottom: '5px', fontFamily: manropeFont }}>Register</h2>
            <form onSubmit={handleRegister}>
              <div style={{ ...styles.sectionHeadingBlue, marginTop: '15px' }}>Are you a teacher or student?</div>
              <div style={{ fontFamily: manropeFont, fontSize: '14px' }}>
                <label style={{ marginRight: '15px', color: charBlack, cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="role"
                    value="Teacher"
                    checked={regRole === 'Teacher'}
                    onChange={() => {
                      setRegRole('Teacher');
                      setRoleError(false);
                      setGeneralRegError(false);
                    }}
                  />{' '}
                  Teacher
                </label>
                <label style={{ color: charBlack, cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="radio"
                    name="role"
                    value="Student"
                    checked={regRole === 'Student'}
                    onChange={() => {
                      setRegRole('Student');
                      setRegGrade('');
                      setRoleError(false);
                      setGradeError(false);
                      setGeneralRegError(false);
                    }}
                  />{' '}
                  Student
                </label>
                <div style={{ color: roleError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>
                  Please select whether you are a teacher registering a new classroom or a student registering into an existing classroom with a classroom code that your teacher has given you. This is a required field.
                </div>
              </div>
              <div style={styles.sectionHeadingBlue}>What grade is your classroom?</div>
              <div style={{ fontFamily: manropeFont }}>
                <select
                  value={regGrade}
                  disabled={regRole === 'Student'}
                  onChange={(e) => {
                    setRegGrade(e.target.value as any);
                    setGradeError(false);
                    setGeneralRegError(false);
                  }}
                  style={{
                    ...styles.inputBox,
                    margin: '0',
                    backgroundColor: regRole === 'Student' ? '#EAEAEA' : '#FFFFFF'
                  }}
                >
                  <option value="">Select Grade Level</option>
                  <option value="K - 5th">K - 5th</option>
                  <option value="6th - 8th">6th - 8th</option>
                  <option value="9th - 12th">9th - 12th</option>
                </select>
                <div style={{ color: gradeError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>
                  If you are a teacher, this is a required field. Please select the grade of your classroom. If you are a student, you do not need to make a selection. Your teacher will have already done this for your classroom.
                </div>
              </div>
              <div style={styles.sectionHeadingBlue}>What is your username?</div>
              <div style={{ fontFamily: manropeFont }}>
                <input
                  type="text"
                  placeholder="username"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value);
                    setRegFormatError(false);
                    setRegTakenError(false);
                    setGeneralRegError(false);
                  }}
                  style={{ ...styles.inputBox, margin: '0' }}
                />
                <div style={{ color: regFormatError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>
                  Please select a username that is 6-12 alphanumeric characters (no special characters).
                </div>
                {regTakenError && (
                  <div style={{ color: 'red', fontSize: '10px', marginTop: '4px' }}>
                    That username has already been registered. Please select a different username.
                  </div>
                )}
              </div>
              <div style={styles.sectionHeadingBlue}>What is your classroom code?</div>
              <div style={{ fontFamily: manropeFont }}>
                <input
                  type="text"
                  placeholder="classroom code"
                  value={regClassroomCode}
                  onChange={(e) => {
                    setRegClassroomCode(e.target.value);
                    setCodeEmptyError(false);
                    setCodeCustomError('');
                    setGeneralRegError(false);
                  }}
                  style={{ ...styles.inputBox, margin: '0' }}
                />
                <div style={{ color: codeEmptyError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>
                  Please enter your classroom code. Teachers: create a new code. Students: enter the code provided by your teacher.
                </div>
                {codeCustomError && (
                  <div style={{ color: 'red', fontSize: '10px', marginTop: '4px' }}>
                    {codeCustomError}
                  </div>
                )}
              </div>
              {generalRegError && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '10px', fontFamily: manropeFont }}>
                  Please correct the errors above before submitting your registration.
                </div>
              )}
              <button type="submit" style={styles.button}>
                Register
              </button>
            </form>
            <div style={styles.linkText}>
              Already have an account?{' '}
              <span
                style={styles.linkAnchor}
                onClick={() => {
                  setCurrentPage('login');
                }}
              >
                Login here.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD / MAIN LAYOUT PAGES ---
  const currentGrade = getCurrentUserGrade();
  const habitsConfig = getHabitsConfig(currentGrade);

  return (
    <div style={styles.dashboardLayout}>
      {/* Sidebar Navigation */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogoBox}>
          <img src={sidebarLogo} alt="Sidebar Logo" style={styles.sidebarLogoImage} />
        </div>
        <button
          style={{
            ...styles.navButton,
            ...(currentPage === 'classroom' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('classroom')}
        >
          Classroom Info
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(currentPage === 'home' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('home')}
        >
          Daily Habits Tracker
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(currentPage === 'log' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('log')}
        >
          Log Habits
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(currentPage === 'view' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('view')}
        >
          View Data
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(currentPage === 'learning' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('learning')}
        >
          Learning Hub
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(currentPage === 'resources' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('resources')}
        >
          Resources
        </button>
        <button
          style={{
            ...styles.navButton,
            ...(currentPage === 'survey' ? styles.activeNavButton : {})
          }}
          onClick={() => setCurrentPage('survey')}
        >
          Feedback Survey
        </button>
        <div style={{ marginTop: 'auto', width: '100%', maxWidth: '220px' }}>
          <button
            style={{
              ...styles.navButton,
              backgroundColor: '#A93226',
              color: '#FFFFFF'
            }}
            onClick={() => {
              setCurrentUser(null);
              setCurrentPage('login');
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <div style={styles.pageTopRightInfo}>
          <div><span style={styles.statusItemLabel}>My Status:</span> {getCurrentUserRole()}</div>
          <div><span style={styles.statusItemLabel}>My Classroom:</span> {getCurrentUserClassroomCode()}</div>
          <div><span style={styles.statusItemLabel}>My Grade:</span> {currentGrade}</div>
          <div><span style={styles.statusItemLabel}>Today's Date:</span> 07/28/2026</div>
        </div>

        {/* PAGE: CLASSROOM INFO */}
        {currentPage === 'classroom' && (
          <div>
            <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>Classroom Information</h2>
            <p style={styles.smallContentText}>
              Welcome, <strong>{currentUser}</strong>! Here is your current registration and classroom setup details.
            </p>
            <div style={styles.halfHeightSpace} />
            <table style={styles.logTable}>
              <tbody>
                <tr>
                  <td style={styles.logTableHeaderCell}>Username</td>
                  <td style={styles.logTableCell}>{currentUser}</td>
                </tr>
                <tr>
                  <td style={styles.logTableHeaderCell}>Role</td>
                  <td style={styles.logTableCell}>{getCurrentUserRole()}</td>
                </tr>
                <tr>
                  <td style={styles.logTableHeaderCell}>Classroom Code</td>
                  <td style={styles.logTableCell}>{getCurrentUserClassroomCode()}</td>
                </tr>
                <tr>
                  <td style={styles.logTableHeaderCell}>Grade Level</td>
                  <td style={styles.logTableCell}>{currentGrade}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* PAGE: HOME / DAILY HABITS TRACKER */}
        {currentPage === 'home' && (
          <div>
            <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>Daily Habits Tracker Overview</h2>
            <p style={styles.smallContentText}>
              Review your weekly progress and compare your performance against classroom averages.
            </p>
            <table style={styles.logTable}>
              <thead>
                <tr>
                  <th style={styles.logTableHeaderCell}>Habit</th>
                  <th style={styles.logTableHeaderCell}>Your Weekly Avg</th>
                  <th style={styles.logTableHeaderCell}>Classroom Weekly Avg</th>
                  <th style={styles.logTableHeaderCell}>Status</th>
                  <th style={styles.logTableHeaderCell}>Goal</th>
                </tr>
              </thead>
              <tbody>
                {habitsConfig.map((h) => {
                  const userAvg = getWeeklyAverage(h.key);
                  const classAvg = getClassroomWeeklyAverage(h.key);
                  return (
                    <tr key={h.key}>
                      <td style={styles.logTableCell}>{h.icon} {h.label}</td>
                      <td style={styles.logTableCell}>{userAvg}</td>
                      <td style={styles.logTableCell}>{classAvg}</td>
                      <td style={styles.logTableCell}>{renderStatusIcon(h.key, userAvg, currentGrade)}</td>
                      <td style={styles.logTableCell}>{h.goal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGE: LOG HABITS */}
        {currentPage === 'log' && (
          <div>
            <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>Log Today's Habits ({getTodayESTFormatted()})</h2>
            <p style={styles.smallContentText}>
              Record your daily habits below and submit your updates for today.
            </p>
            {logSuccessMsg && (
              <div style={{ color: 'green', fontWeight: 'bold', marginBottom: '15px', fontFamily: manropeFont }}>
                {logSuccessMsg}
              </div>
            )}
            <form onSubmit={handleLogSubmit}>
              {habitsConfig.map((h) => (
                <div key={h.key} style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontFamily: manropeFont }}>
                    {h.icon} {h.label} (Goal: {h.goal})
                  </label>
                  <select
                    value={logFormValues[h.key]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setLogFormValues({ ...logFormValues, [h.key]: val });
                    }}
                    style={styles.inputBox}
                  >
                    {h.selections.map((sel) => (
                      <option key={sel} value={sel}>
                        {h.selectionLabels && h.selectionLabels[sel] ? h.selectionLabels[sel] : sel}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button type="submit" style={styles.button}>
                Submit Daily Log
              </button>
            </form>
          </div>
        )}

        {/* PAGE: VIEW DATA */}
        {currentPage === 'view' && (
          <div>
            <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>View 28-Day Habit History</h2>
            <p style={styles.smallContentText}>
              Select a habit category below to inspect your consistency over the past 28 days.
            </p>
            <div style={{ margin: '15px 0' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as HabitKey)}
                style={styles.inputBox}
              >
                {habitsConfig.map((h) => (
                  <option key={h.key} value={h.key}>
                    {h.icon} {h.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.gridTable}>
              {get28DayGrid().map((cell, idx) => {
                const val = cell.entry && cell.entry[selectedCategory] !== undefined ? cell.entry[selectedCategory] : '-';
                return (
                  <div key={idx} style={styles.gridCell}>
                    <div style={{ fontSize: '11px', color: '#666' }}>{formatDateToMDY(cell.dateStr)}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', marginTop: '4px' }}>{val}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAGE: LEARNING HUB */}
        {currentPage === 'learning' && (
          <div>
            <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>Learning Hub</h2>
            <p style={styles.smallContentText}>
              Explore educational modules and guides designed to help you build and maintain healthy daily routines.
            </p>
            <div style={styles.halfHeightSpace} />
            <div style={styles.smallContentHeader}>Sleep & Recovery</div>
            <p style={styles.smallContentText}>Getting enough rest is crucial for cognitive performance, mood regulation, and physical health.</p>
            <div style={styles.smallContentHeader}>Nutrition & Whole Foods</div>
            <p style={styles.smallContentText}>Focusing on whole foods and balanced hydration supports sustained energy throughout the school day.</p>
          </div>
        )}

        {/* PAGE: RESOURCES */}
        {currentPage === 'resources' && (
          <div>
            <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>Resources</h2>
            <p style={styles.smallContentText}>
              Access additional external tools, reading materials, and healthy lifestyle guides.
            </p>
            <div style={styles.halfHeightSpace} />
            <a href="https://www.cdc.gov" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
              CDC Healthy Schools Guidelines
            </a>
            <a href="https://www.who.int" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
              World Health Organization Nutrition Guide
            </a>
          </div>
        )}

        {/* PAGE: FEEDBACK SURVEY */}
        {currentPage === 'survey' && (
          <div>
            <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>Feedback Survey</h2>
            <p style={styles.smallContentText}>
              Your feedback helps us continuously improve the HealthyHabitsED platform experience.
            </p>
            {surveySuccessMsg && (
              <div style={{ color: 'green', fontWeight: 'bold', marginBottom: '15px', fontFamily: manropeFont }}>
                {surveySuccessMsg}
              </div>
            )}
            <form onSubmit={handleSurveySubmit}>
              <div style={styles.sectionHeadingBlue}>What was your hardest habit to maintain this week?</div>
              <input
                type="text"
                value={surveyStudentHardestHabit}
                onChange={(e) => setSurveyStudentHardestHabit(e.target.value)}
                style={styles.inputBox}
                placeholder="e.g. Sleep or Sugary Drinks"
              />
              <div style={styles.sectionHeadingBlue}>Do you have any additional tips or feedback to share?</div>
              <textarea
                value={surveyStudentMoreTips}
                onChange={(e) => setSurveyStudentMoreTips(e.target.value)}
                style={{ ...styles.inputBox, height: '90px' }}
                placeholder="Share your thoughts here..."
              />
              <button type="submit" style={styles.button}>
                Submit Survey
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}