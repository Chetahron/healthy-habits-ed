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
  username: string;
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
  const [surveyTeacherChallenge, setSurveyTeacherChallenge] = useState('');
  const [surveyStudentHardestHabit, setSurveyStudentHardestHabit] = useState('');
  const [surveyStudentDifficultyReason, setSurveyStudentDifficultyReason] = useState('');
  const [surveyStudentResourceInterest, setSurveyStudentResourceInterest] = useState('');
  const [surveyStudentImpact, setSurveyStudentImpact] = useState('');
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
  const getCurrentUserRole = (): 'Teacher' | 'Student' => {
    if (!currentUser || !usersDb[currentUser]) return 'Student';
    return usersDb[currentUser].role || 'Student';
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
        { key: 'sleep', label: 'Sleep', icon: '💤', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], selectionLabels: { 12: '12+' }, goal: '9 - 12 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], selectionLabels: { 9: '9+' }, goal: '6 - 9 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80%+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40%+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🥤', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 drinks / day' },
        { key: 'mood', label: 'Mood', icon: '⭐', selections: [1, 2, 3], goal: '3 stars' },
      ];
    } else if (grade === '6th - 8th') {
      return [
        { key: 'sleep', label: 'Sleep', icon: '💤', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], selectionLabels: { 10: '10+' }, goal: '8 - 10 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], selectionLabels: { 11: '11+' }, goal: '8 - 11 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80%+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40%+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🥤', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 - 1 drinks / day' },
        { key: 'mood', label: 'Mood', icon: '⭐', selections: [1, 2, 3], goal: '3 stars' },
      ];
    } else {
      return [
        { key: 'sleep', label: 'Sleep', icon: '💤', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], selectionLabels: { 10: '10+' }, goal: '8 - 10 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], selectionLabels: { 13: '13+' }, goal: '9 - 13 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80%+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40%+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🥤', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 - 1 drinks / day' },
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
        case 'sleep':
          return val >= 9 ? 'green' : val === 8 ? 'yellow' : 'red';
        case 'physicalActivity':
          return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water':
          return val >= 6 ? 'green' : val === 5 ? 'yellow' : 'red';
        case 'fruitsVeg':
          return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods':
          return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf':
          return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'mood':
          return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
      }
    } else if (grade === '6th - 8th') {
      switch (key) {
        case 'sleep':
          return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'physicalActivity':
          return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water':
          return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'fruitsVeg':
          return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods':
          return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf':
          return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'mood':
          return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
      }
    } else {
      switch (key) {
        case 'sleep':
          return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'physicalActivity':
          return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water':
          return val >= 9 ? 'green' : val === 8 ? 'yellow' : 'red';
        case 'fruitsVeg':
          return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods':
          return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf':
          return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'mood':
          return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
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
      username: trimmedUser,
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
    headerLogoImage: {
      maxWidth: '440px',
      maxHeight: '270px',
      objectFit: 'contain',
      margin: '0 0 5px 0',
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
      maxWidth: '110px',
      backgroundColor: 'transparent',
      padding: '6px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '8px',
      boxSizing: 'border-box',
    },
    sidebarLogoImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '60px',
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
                  If you are a teacher registering a new classroom, please enter a unique code for your classroom. If you are a student joining your teacher’s classroom, please enter the classroom code that your teacher gave you.
                </div>
                {codeCustomError && (
                  <div style={{ color: 'red', fontSize: '10px', marginTop: '4px' }}>
                    {codeCustomError}
                  </div>
                )}
              </div>

              <button type="submit" style={styles.button}>
                Register
              </button>

              {generalRegError && (
                <div style={{ color: 'red', fontSize: '13px', marginTop: '8px', fontWeight: 'bold', textAlign: 'center' }}>
                  Try registering again. The information indicated above is incorrect.
                </div>
              )}
            </form>

            <div style={styles.linkText}>
              Already have an account?{' '}
              <span
                style={styles.linkAnchor}
                onClick={() => {
                  setRegFormatError(false);
                  setRegTakenError(false);
                  setCurrentPage('login');
                }}
              >
                Log In Now
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD WRAPPER ---
  const currentUserGrade = getCurrentUserGrade();
  const currentUserClassroom = getCurrentUserClassroomCode();
  const currentUserRole = getCurrentUserRole();
  const habitsConfig = getHabitsConfig(currentUserGrade);

  return (
    <div style={styles.appContainer}>
      <div style={styles.dashboardLayout}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogoBox}>
            <img
              src={sidebarLogo}
              alt="HealthyHabitsED Logo"
              style={styles.sidebarLogoImage}
            />
          </div>

          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'classroom' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('classroom')}
          >
            My Classroom Scorecard
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'home' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('home')}
          >
            My Scorecard
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'log' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('log')}
          >
            My Daily Data Log
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'view' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('view')}
          >
            My Daily Data View
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'learning' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('learning')}
          >
            Learning Center
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'resources' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('resources')}
          >
            Community Resources
          </button>

          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'survey' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('survey')}
          >
            Survey
          </button>

          <button
            style={{
              ...styles.navButton,
              marginTop: 'auto',
              backgroundColor: '#d9534f',
              color: '#ffffff'
            }}
            onClick={() => {
              setCurrentUser(null);
              setCurrentPage('login');
            }}
          >
            Log Out
          </button>
        </div>

        <div style={styles.mainContent}>
          {/* Top header image and info */}
          <div style={{ textAlign: 'left', marginBottom: '25px' }}>
            <img src={logo} alt="HealthyHabitsED Logo" style={styles.headerLogoImage} />

            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px', lineHeight: '1.5' }}>
              My Classroom: {currentUserClassroom}
            </div>
            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px', lineHeight: '1.5' }}>
              My Grade: {currentUserGrade}
            </div>
            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px', lineHeight: '1.5' }}>
              Today's Date: {getTodayESTFormatted()}
            </div>
          </div>

          {/* My Classroom Scorecard Page */}
          {currentPage === 'classroom' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont, fontSize: '24px', fontWeight: 'bold' }}>
                My Classroom’s Scorecard (Weekly Average)
              </h2>

              <table style={styles.logTable}>
                <thead>
                  <tr>
                    <th style={styles.logTableHeaderCell}>Habit</th>
                    <th style={styles.logTableHeaderCell}>Goal</th>
                    <th style={styles.logTableHeaderCell}>Weekly Average</th>
                  </tr>
                </thead>
                <tbody>
                  {habitsConfig.map((h) => {
                    const avg = getClassroomWeeklyAverage(h.key);
                    return (
                      <tr key={h.key}>
                        <td style={styles.logTableCell}>
                          {h.icon} {h.label}
                        </td>
                        <td style={styles.logTableCell}>{h.goal}</td>
                        <td style={styles.logTableCell}>
                          {avg} <span style={{ marginLeft: '10px' }}>{renderStatusIcon(h.key, avg, currentUserGrade)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* My Scorecard Page */}
          {currentPage === 'home' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont, fontSize: '24px', fontWeight: 'bold' }}>
                My Scorecard (Weekly Average)
              </h2>

              <table style={styles.logTable}>
                <thead>
                  <tr>
                    <th style={styles.logTableHeaderCell}>Habit</th>
                    <th style={styles.logTableHeaderCell}>Goal</th>
                    <th style={styles.logTableHeaderCell}>Weekly Average</th>
                  </tr>
                </thead>
                <tbody>
                  {habitsConfig.map((h) => {
                    const avg = getWeeklyAverage(h.key);
                    return (
                      <tr key={h.key}>
                        <td style={styles.logTableCell}>
                          {h.icon} {h.label}
                        </td>
                        <td style={styles.logTableCell}>{h.goal}</td>
                        <td style={styles.logTableCell}>
                          {avg} <span style={{ marginLeft: '10px' }}>{renderStatusIcon(h.key, avg, currentUserGrade)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Log My Daily Data Page */}
          {currentPage === 'log' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont, fontSize: '24px', fontWeight: 'bold' }}>My Daily Data Log</h2>

              <form onSubmit={handleLogSubmit}>
                <table style={styles.logTable}>
                  <thead>
                    <tr>
                      <th style={styles.logTableHeaderCell}>Habit</th>
                      <th style={styles.logTableHeaderCell}>Selection</th>
                      <th style={styles.logTableHeaderCell}>Goal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {habitsConfig.map((h) => (
                      <tr key={h.key}>
                        <td style={styles.logTableCell}>
                          {h.icon} {h.label}
                        </td>
                        <td style={styles.logTableCell}>
                          <select
                            value={logFormValues[h.key] ?? h.selections[0]}
                            onChange={(e) =>
                              setLogFormValues({
                                ...logFormValues,
                                [h.key]: Number(e.target.value)
                              })
                            }
                            style={{ ...styles.inputBox, width: '130px', margin: 0 }}
                          >
                            {h.selections.map((val) => (
                              <option key={val} value={val}>
                                {h.selectionLabels && h.selectionLabels[val]
                                  ? h.selectionLabels[val]
                                  : val}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.logTableCell}>{h.goal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button type="submit" style={{ ...styles.button, width: '200px', marginTop: '20px' }}>
                  Submit
                </button>
              </form>

              {logSuccessMsg && (
                <div style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>
                  {logSuccessMsg}
                </div>
              )}
            </div>
          )}

          {/* View My Daily Data Page */}
          {currentPage === 'view' && (
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont, fontSize: '24px', fontWeight: 'bold' }}>My Daily Data View (4-Week)</h2>

              <div style={{ marginBottom: '20px', fontSize: '16px', fontFamily: manropeFont }}>
                <span style={{ color: steelBlue, fontWeight: 'bold' }}>Habit: </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as HabitKey)}
                  style={{ ...styles.inputBox, width: '240px', display: 'inline-block', margin: '0 15px 0 5px', color: charBlack }}
                >
                  {habitsConfig.map((h) => (
                    <option key={h.key} value={h.key} style={{ color: charBlack }}>
                      {h.label}
                    </option>
                  ))}
                </select>

                <span style={{ color: steelBlue, fontWeight: 'bold' }}>Goal: </span>
                <span style={{ color: charBlack }}>
                  {habitsConfig.find((h) => h.key === selectedCategory)?.goal}
                </span>
              </div>

              {/* 28-Day Calendar Grid */}
              <div style={styles.gridTable}>
                {get28DayGrid().map(({ dateStr, entry }) => {
                  const val = entry ? entry[selectedCategory] : undefined;
                  let fontColor = charBlack;

                  if (val !== undefined) {
                    const status = getHabitColor(selectedCategory, val, currentUserGrade);
                    if (status === 'green') fontColor = 'green';
                    else if (status === 'yellow') fontColor = '#D4AC0D';
                    else fontColor = 'red';
                  }

                  return (
                    <div key={dateStr} style={styles.gridCell}>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                        {formatDateToMDY(dateStr)}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: fontColor }}>
                        {val !== undefined ? val : 'Not Logged'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Learning Center Page */}
          {currentPage === 'learning' && (
            <div style={{ textAlign: 'left', maxWidth: '800px', lineHeight: '1.6' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont, fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                Learning Center
              </h2>

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What is Sleep?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Sleep is when your brain and body recharge so you can learn, grow, and feel your best. Getting the right amount of sleep every night helps you succeed in school, sports, and everyday life.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Your Brain Gets Stronger</h4>
              <p style={{ margin: '0 0 8px 0' }}>While you sleep, your brain organizes what you learned during the day and stores it as memories. Good sleep helps you focus, solve problems, and remember what you study.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Your Body Grows While You Sleep</h4>
              <p style={{ margin: '0 0 8px 0' }}>Your body releases important growth hormones while you sleep. Sleep also helps your muscles recover, strengthens your immune system, and gives you energy for tomorrow.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Better Sleep = Better Days</h4>
              <p style={{ margin: '0 0 15px 0' }}>Students who get enough sleep are more likely to feel happier, pay attention in class, and make good decisions. A regular bedtime can make a big difference.</p>

              <br />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What is Physical Activity?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Physical activity is any movement that gets your body working, from playing outside to sports, dancing, biking, or walking. Aim for about 60 minutes of activity each day.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Exercise Builds a Strong Body</h4>
              <p style={{ margin: '0 0 8px 0' }}>Being active strengthens your heart, muscles, and bones while improving balance, coordination, and endurance.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Moving Helps Your Brain</h4>
              <p style={{ margin: '0 0 8px 0' }}>Exercise increases blood flow to your brain, helping you concentrate, learn new things, and think more clearly.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Movement Boosts Your Mood</h4>
              <p style={{ margin: '0 0 15px 0' }}>Physical activity releases chemicals in your brain that can help you feel happier, less stressed, and more confident.</p>

              <br />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What is Water?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Water is the best drink for your body because every organ depends on it to work properly. Staying hydrated helps you feel energized and ready to learn.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Water Powers Your Brain</h4>
              <p style={{ margin: '0 0 8px 0' }}>Even mild dehydration can make it harder to concentrate, remember information, and stay alert during school.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Water Keeps Your Body Running</h4>
              <p style={{ margin: '0 0 8px 0' }}>Water helps regulate your body temperature, moves nutrients where they're needed, and supports healthy digestion.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Water Beats Sugary Drinks</h4>
              <p style={{ margin: '0 0 15px 0' }}>Choosing water instead of sugary drinks helps protect your teeth and gives your body what it needs without added sugar.</p>

              <br />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What are Fruits & Vegetables?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Fruits and vegetables are packed with vitamins, minerals, fiber, and antioxidants that help your body stay healthy. Eating a colorful variety gives your body many important nutrients.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Colors Mean Different Nutrients</h4>
              <p style={{ margin: '0 0 8px 0' }}>Red, orange, yellow, green, blue, and purple fruits and vegetables all contain different nutrients that help your body in different ways.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Fuel for Your Body</h4>
              <p style={{ margin: '0 0 8px 0' }}>Fruits and vegetables help support healthy digestion, strengthen your immune system, and provide steady energy throughout the day.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Healthy Habits Start Young</h4>
              <p style={{ margin: '0 0 15px 0' }}>Eating plenty of fruits and vegetables while you're growing helps build lifelong healthy eating habits.</p>

              <br />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What are Whole Foods?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Whole foods are foods that are close to their natural form with little processing, like apples, oatmeal, eggs, beans, yogurt, nuts, and fresh vegetables. They provide the nutrients your body needs to grow and stay healthy.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Better Fuel</h4>
              <p style={{ margin: '0 0 8px 0' }}>Whole foods usually contain more fiber, vitamins, and minerals than highly processed foods, helping your body work its best.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Longer-Lasting Energy</h4>
              <p style={{ margin: '0 0 8px 0' }}>Whole foods often help you stay full longer and provide steady energy for school, sports, and play.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Small Choices Matter</h4>
              <p style={{ margin: '0 0 15px 0' }}>You don't have to eat perfectly. Choosing whole foods more often is a great way to build healthy habits over time.</p>

              <br />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What are Ultra-Processed Foods?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Ultra-processed foods are made with many added ingredients and often contain extra sugar, salt, unhealthy fats, or artificial flavors. Examples include many chips, candy, soda, and packaged desserts.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Fine Sometimes, Not All the Time</h4>
              <p style={{ margin: '0 0 8px 0' }}>Ultra-processed foods can be enjoyable occasionally, but eating too many may crowd out more nutritious foods your body needs.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Less Nutrition</h4>
              <p style={{ margin: '0 0 8px 0' }}>Many ultra-processed foods contain fewer vitamins, minerals, and fiber than whole foods.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Think About Balance</h4>
              <p style={{ margin: '0 0 15px 0' }}>You don't have to avoid these foods completely. Choosing whole foods most of the time helps your body and brain stay healthier.</p>

              <br />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What are Sugary Drinks?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Sugary drinks include soda, many sports drinks, sweet teas, fruit drinks with added sugar, and energy drinks. They often contain lots of sugar but very few nutrients.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Sugar Adds Up Fast</h4>
              <p style={{ margin: '0 0 8px 0' }}>One sugary drink can contain many teaspoons of added sugar. Drinking them often can make it harder to meet healthy nutrition goals.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Water Is the Best Choice</h4>
              <p style={{ margin: '0 0 8px 0' }}>Water is the best way to stay hydrated before school, during sports, and throughout the day.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Protect Your Smile</h4>
              <p style={{ margin: '0 0 15px 0' }}>Drinking fewer sugary beverages can help reduce the risk of cavities and keep your teeth healthier.</p>

              <br />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>
                What is Mood?
              </h3>
              <p style={{ margin: '0 0 10px 0' }}>
                Your mood is how you feel emotionally throughout the day. Everyone has good days and bad days, and healthy habits can help support a more positive mood over time.
              </p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>1. Healthy Habits Work Together</h4>
              <p style={{ margin: '0 0 8px 0' }}>Getting enough sleep, drinking water, eating nutritious foods, and staying active all work together to help you feel your best.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>2. Your Body and Brain Are Connected</h4>
              <p style={{ margin: '0 0 8px 0' }}>When your body has the fuel, movement, and rest it needs, your brain often works better too, making it easier to learn, focus, and handle challenges.</p>
              <h4 style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>3. Small Habits Can Make a Big Difference</h4>
              <p style={{ margin: '0 0 15px 0' }}>No single habit controls your mood, but practicing healthy habits consistently can help you feel more energetic, focused, and ready to take on each day. If you're feeling down or overwhelmed for a long time, it's important to talk with a trusted adult, parent, teacher, or school counselor.</p>
            </div>
          )}

          {/* Community Resources Page */}
          {currentPage === 'resources' && (
            <div style={{ textAlign: 'left', maxWidth: '800px', lineHeight: '1.6' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont, fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                Community Resources in Indianapolis, IN
              </h2>

              <br />

              <h3 style={{ fontWeight: 'bold', fontSize: '17px', margin: '10px 0 6px 0' }}>Free Groceries and Meals</h3>
              <p style={{ margin: '0 0 8px 0' }}>
                Find services where you can search for free groceries and meals if you or your family need extra help. Food pantries, specifically, help make sure everyone has access to healthy food, no matter their financial situation.
              </p>
              <a href="https://www.communitycompass.app/home" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Community Compass
              </a>
              <a href="https://www.foodpantries.org/ci/in-indianapolis" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Indianapolis Food Pantries
              </a>

              <br />

              <h3 style={{ fontWeight: 'bold', fontSize: '17px', margin: '10px 0 6px 0' }}>Free Student Meal Services</h3>
              <p style={{ margin: '0 0 8px 0' }}>
                Find free student meal programs that provide nutritious breakfast, lunch, and snack options, helping you stay healthy, energized, and ready to learn during the school year and summer.
              </p>
              <a href="https://www.myips.org/student-family-references/foodservice" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Indianapolis Public Schools
              </a>
              <a href="https://parks.indy.gov/programs/free-meals-programs/?utm_source=chatgpt.com" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Indy Parks & Recreation
              </a>

              <br />

              <h3 style={{ fontWeight: 'bold', fontSize: '17px', margin: '10px 0 6px 0' }}>Youth Activities - Parks, Playgrounds, Walking Trails & Sports</h3>
              <p style={{ margin: '0 0 8px 0' }}>
                Find parks, playgrounds, trails, and youth sports programs that provide fun and safe places for you to be active, build strength and confidence, enjoy nature, learn teamwork, and improve your physical and mental health.
              </p>
              <a href="https://parks.indy.gov/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Indy Parks & Recreation
              </a>
              <a href="https://www.indy.gov/activity/find-a-trail" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                indy.gov trails
              </a>
              <a href="https://anc.apm.activecommunities.com/indyparks/activity/search?onlineSiteId=0&activity_select_param=2&activity_department_ids=4&viewMode=list" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Youth sports
              </a>

              <br />

              <h3 style={{ fontWeight: 'bold', fontSize: '17px', margin: '10px 0 6px 0' }}>Community Recreation Centers</h3>
              <p style={{ margin: '0 0 8px 0' }}>
                Find a Community Center near you to stay active, learn new skills, and spend time with others. Many offer free or low-cost programs that help kids and families stay healthy, active, and connected.
              </p>
              <a href="https://parks.indy.gov/programs/free-meals-programs/?utm_source=chatgpt.com" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Map of Indianapolis Community Centers
              </a>

              <br />

              <h3 style={{ fontWeight: 'bold', fontSize: '17px', margin: '10px 0 6px 0' }}>Homework Help</h3>
              <p style={{ margin: '0 0 8px 0' }}>
                Find programs that offer you free or low-cost support from teachers, tutors, or volunteers to better understand schoolwork, complete assignments, and build confidence in learning.
              </p>
              <a href="https://www.indypl.org/services/homework-help" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Indianapolis Public Library
              </a>

              <br />

              <h3 style={{ fontWeight: 'bold', fontSize: '17px', margin: '10px 0 6px 0' }}>Mentoring</h3>
              <p style={{ margin: '0 0 8px 0' }}>
                Find a trusted adult who encourages, supports, and guides you by helping you build confidence, develop new skills, set goals, and succeed in school and life.
              </p>
              <a href="https://www.bebigforkids.org/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Big Brothers Big Sisters of Central Indiana
              </a>
              <a href="https://www.bgcindy.org/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Boys and Girls Club of Indianapolis
              </a>
              <a href="https://dreamaliveinc.org/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Dream Alive
              </a>
              <a href="https://www.elevateindy.org/holistic-mentoring" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Elevate Indianapolis
              </a>
              <a href="https://www.starfishinitiative.org/?utm_source=chatgpt.com" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
                Starfish Initiative
              </a>
            </div>
          )}

          {/* Survey Page */}
          {currentPage === 'survey' && (
            <div style={{ textAlign: 'left', maxWidth: '750px', lineHeight: '1.6' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont, fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                Survey
              </h2>

              <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 6px 0' }}>
                Help Us Help You!
              </p>
              <p style={{ margin: '0 0 15px 0' }}>
                Your answers can help us understand what healthy habits are easiest and hardest for students. Your responses are voluntary and anonymous. Additionally, you can find additional information, programs, and community resources that support your health, learning, and success by selecting the Indy Community Resources page in the left hand navigation bar.
              </p>

              <br />

              <form onSubmit={handleSurveySubmit}>
                {currentUserRole === 'Teacher' ? (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                      What is the biggest health or wellness challenge you see affecting your students' ability to learn?
                    </p>
                    <select
                      value={surveyTeacherChallenge}
                      onChange={(e) => setSurveyTeacherChallenge(e.target.value)}
                      style={{ ...styles.inputBox, maxWidth: '350px' }}
                    >
                      <option value="">Select an option...</option>
                      <option value="Sleep">Sleep</option>
                      <option value="Nutrition">Nutrition</option>
                      <option value="Physical activity">Physical activity</option>
                      <option value="Hydration">Hydration</option>
                      <option value="Stress or emotional well-being">Stress or emotional well-being</option>
                      <option value="Attendance">Attendance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    {/* Q1 */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        Which healthy habit is the hardest for you to practice consistently?
                      </p>
                      <select
                        value={surveyStudentHardestHabit}
                        onChange={(e) => setSurveyStudentHardestHabit(e.target.value)}
                        style={{ ...styles.inputBox, maxWidth: '380px' }}
                      >
                        <option value="">Select an option...</option>
                        <option value="Getting enough sleep">Getting enough sleep</option>
                        <option value="Drinking enough water">Drinking enough water</option>
                        <option value="Eating fruits and vegetables">Eating fruits and vegetables</option>
                        <option value="Being physically active">Being physically active</option>
                        <option value="Limiting sugary drinks or ultra-processed foods">Limiting sugary drinks or ultra-processed foods</option>
                        <option value="Nothing in particular right now">Nothing in particular right now</option>
                      </select>
                    </div>

                    {/* Q2 */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        What makes healthy habits difficult for you?
                      </p>
                      {[
                        "I don't have enough time",
                        "Healthy foods or activities cost too much",
                        "I don't have transportation",
                        "I have too much homework or other responsibilities",
                        "I don't have a safe place to be active",
                        "I don't know where to find healthy resources",
                        "Something else",
                        "Nothing in particular right now"
                      ].map((opt) => (
                        <label key={opt} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="surveyDifficulty"
                            value={opt}
                            checked={surveyStudentDifficultyReason === opt}
                            onChange={(e) => setSurveyStudentDifficultyReason(e.target.value)}
                            style={{ marginRight: '8px' }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>

                    {/* Q3 */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        Which free community resources would you like to learn more about?
                      </p>
                      {[
                        "Free student meals",
                        "Food pantries",
                        "Recreation centers",
                        "Parks, playgrounds, and trails",
                        "Youth sports",
                        "Homework help or tutoring",
                        "Mentoring programs",
                        "None right now"
                      ].map((opt) => (
                        <label key={opt} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="surveyResources"
                            value={opt}
                            checked={surveyStudentResourceInterest === opt}
                            onChange={(e) => setSurveyStudentResourceInterest(e.target.value)}
                            style={{ marginRight: '8px' }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>

                    {/* Q4 */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        How has practicing healthy habits affected you this month?
                      </p>
                      {[
                        "I have more energy",
                        "I can focus better in class",
                        "I’m sleeping better or more",
                        "My mood has improved",
                        "I feel stronger or more active",
                        "I haven’t noticed a difference, yet"
                      ].map((opt) => (
                        <label key={opt} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="surveyImpact"
                            value={opt}
                            checked={surveyStudentImpact === opt}
                            onChange={(e) => setSurveyStudentImpact(e.target.value)}
                            style={{ marginRight: '8px' }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>

                    {/* Q5 */}
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                        Would you like more healthy habit tips and local resources?
                      </p>
                      <select
                        value={surveyStudentMoreTips}
                        onChange={(e) => setSurveyStudentMoreTips(e.target.value)}
                        style={{ ...styles.inputBox, maxWidth: '250px' }}
                      >
                        <option value="">Select an option...</option>
                        <option value="Yes">Yes</option>
                        <option value="Maybe later">Maybe later</option>
                        <option value="No thanks">No thanks</option>
                      </select>
                    </div>
                  </div>
                )}

                <br />

                <button type="submit" style={{ ...styles.button, width: '180px' }}>
                  Submit
                </button>
              </form>

              {surveySuccessMsg && (
                <div style={{ color: 'green', marginTop: '12px', fontWeight: 'bold' }}>
                  {surveySuccessMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}