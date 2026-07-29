import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';


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
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'classroom' | 'home' | 'log' | 'view'>('login');
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
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🥤', selections: [0, 1], selectionLabels: { 1: '1+' }, goal: '0 drinks / day' },
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


  // Color Coding Helper
  const getHabitColor = (key: HabitKey, val: number, grade: string): 'red' | 'yellow' | 'green' => {
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
        case 'sugaryDrinks':
          return val === 0 ? 'green' : 'red';
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
        case 'sugaryDrinks':
          return val <= 1 ? 'green' : 'red';
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
        case 'sugaryDrinks':
          return val <= 1 ? 'green' : 'red';
        case 'mood':
          return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
      }
    }
  };


  // --- Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = (loginUsername || '').trim();
    if (usersDb[trimmed]) {
      setCurrentUser(trimmed);
      setLoginError('');
      setLoginUsername('');
      setCurrentPage('home');
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
    setCurrentPage('home');
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
    return Math.round((sum / validValues.length) * 10) / 10;
  };


  // EDIT 16: Classroom Weekly Average calculation
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
    return Math.round(avg * 10) / 10;
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


  // EDIT 16: Yellow circle is made larger to closely match check and X size
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
      width: '220px',
      backgroundColor: steelBlue,
      color: '#FFFFFF',
      padding: '20px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    navButton: {
      width: '100%',
      backgroundColor: cream,
      color: charBlack,
      border: '1px solid transparent',
      padding: '10px',
      margin: '8px 0',
      cursor: 'pointer',
      fontFamily: manropeFont,
      fontSize: '15px',
      fontWeight: 600,
      textAlign: 'center',
      borderRadius: '4px',
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
  const habitsConfig = getHabitsConfig(currentUserGrade);


  return (
    <div style={styles.appContainer}>
      <div style={styles.dashboardLayout}>
        <div style={styles.sidebar}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img
              src={logo}
              alt="HealthyHabitsED Logo"
              style={{
                maxWidth: '120px',
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </div>


          {/* EDIT 16 Requirement: My Classroom Scorecard button at top */}
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
            My Weekly Scorecard
          </button>


          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'log' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('log')}
          >
            Log My Daily Data
          </button>


          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'view' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('view')}
          >
            View My Daily Data
          </button>


          <button
            style={{ ...styles.navButton, marginTop: 'auto', opacity: 0.9 }}
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


            {/* EDIT 16 Requirement: Add My Classroom above My Grade */}
            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px' }}>
              My Classroom: {currentUserClassroom}
            </div>
            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px' }}>
              My Grade: {currentUserGrade}
            </div>
            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px' }}>
              Today's Date: {getTodayESTFormatted()}
            </div>
          </div>


          {/* EDIT 16 Requirement: My Classroom Scorecard Page */}
          {currentPage === 'classroom' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>
                My Classroom’s Healthy Habits Scorecard (Weekly Average)
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


          {/* Home / Weekly Scorecard */}
          {currentPage === 'home' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>
                My Healthy Habits Scorecard (Weekly Average)
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
              <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>Log My Daily Data</h2>


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
                            value={logFormValues[h.key]}
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
              <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>View My Daily Data (4-Week)</h2>


              <div style={{ marginBottom: '20px', fontSize: '16px', fontFamily: manropeFont }}>
                <span style={{ color: steelBlue, fontWeight: 'bold' }}>Habit: </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as HabitKey)}
                  style={{ ...styles.inputBox, width: '240px', display: 'inline-block', margin: '0 15px 0 5px', color: charBlack }}
                >
                  {/* EDIT 16 Requirement: Only include the text before the comma */}
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
        </div>
      </div>
    </div>
  );
}

