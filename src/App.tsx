import React, { useState, useEffect } from 'react';

// --- LOGO URLs (Updated per Edit 14) --- 
const MAIN_LOGO_URL = 'https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmE2NjRhMWZmYWFjODE5MTg0Mzc1MzE3ZjQwMjJlYzY6ZmlsZV8wMDAwMDAwMGFmYzA4MjBjYjNiODNhOGI0NDc1ZTgxMSIsImdpem1vX2lkIjpudWxsLCJ3aWQiOm51bGwsIm9pZCI6bnVsbCwidHMiOiIyMDY2MSIsInAiOiJweWkiLCJjaWQiOiIxIiwic2lnIjoiOWNlODg4YmMzMzNhZTYzYTc0NTJiOWM4NjVhNGMzOTEyNjllMGQ5MTU2YzU1ZWRkYWVkYzNmNGVkNTMyNDYyYSIsInYiOiIwIiwiY3MiOm51bGwsImNkbiI6bnVsbCwiZm4iOm51bGwsImNkIjpudWxsLCJjcCI6bnVsbCwibWEiOm51bGx9';
const NAV_LOGO_URL = 'https://chatgpt.com/backend-api/estuary/content?id=file_00000000284881f59e0145e45b960bf8&ts=495883&p=fs&cid=1&sig=0e259d2963519c6147329d34157d809dc71fb5196d0e7b8812fdd87c544e571d&v=0';

// ==========================================
// --- BACKGROUND LOOKUP TABLES (Edit 12) --- 
// ==========================================

export const LOOKUP_1 = {
  title: "Lookup 1",
  columns: [
    "Grade", "Sleep", "Brush Teeth", "Physical Activity", "Outdoor Time",
    "Reading", "Recreational Screen Time", "Water", "Fruits & Vegetables",
    "Whole Foods", "Ultra-Processed Foods", "Sugary Drinks"
  ],
  rows: {
    "K - 5th": {
      Sleep: "9 - 12 hours / night",
      "Brush Teeth": "2+ times / day",
      "Physical Activity": "60+ minutes / day",
      "Outdoor Time": "60 - 12 minutes / day",
      Reading: "20 minutes / day",
      "Recreational Screen Time": "< 120 minutes / day",
      Water: "6 - 9 cups / day",
      "Fruits & Vegetables": ">= 5 servings / day",
      "Whole Foods": ">= 80% / day",
      "Ultra-Processed Foods": "<= 20% / day",
      "Sugary Drinks": "0"
    },
    "6th - 8th": {
      Sleep: "8 - 10 hours / night",
      "Brush Teeth": "X",
      "Physical Activity": "60+ minutes / day",
      "Outdoor Time": "60+ minutes / day",
      Reading: "X",
      "Recreational Screen Time": "X",
      Water: "8 - 11 cups / day",
      "Fruits & Vegetables": ">= 5 servings / day",
      "Whole Foods": ">= 80% / day",
      "Ultra-Processed Foods": "<= 20% / day",
      "Sugary Drinks": "0 - 1 / day"
    },
    "9th - 12th": {
      Sleep: "8 - 10 hours / night",
      "Brush Teeth": "X",
      "Physical Activity": "60+ minutes / day",
      "Outdoor Time": "60+ minutes / day",
      Reading: "X",
      "Recreational Screen Time": "X",
      Water: "9 - 13+ cups / day",
      "Fruits & Vegetables": ">= 5 servings / day",
      "Whole Foods": ">= 80% / day",
      "Ultra-Processed Foods": "<= 20% / day",
      "Sugary Drinks": "0 - 1 / day"
    },
    Increments: {
      Sleep: "1",
      "Brush Teeth": "1",
      "Physical Activity": "15",
      "Outdoor Time": "15",
      Reading: "5",
      "Recreational Screen Time": "20",
      Water: "1",
      "Fruits & Vegetables": "1",
      "Whole Foods": "10",
      "Ultra-Processed Foods": "10",
      "Sugary Drinks": "1"
    }
  }
};

export const LOOKUP_2 = {
  title: "Lookup 2",
  columns: [
    "Grade", "Water_Green", "Water_Yellow", "Water_Red",
    "FruitsVeg_Green", "FruitsVeg_Yellow", "FruitsVeg_Red",
    "WholeFoods_Green", "WholeFoods_Yellow", "WholeFoods_Red",
    "UPF_Green", "UPF_Yellow", "UPF_Red",
    "SugaryDrinks_Green", "SugaryDrinks_Yellow", "SugaryDrinks_Red"
  ],
  rows: {
    "K - 5th": {
      Water_Green: "6+", Water_Yellow: "5", Water_Red: "0-4",
      FruitsVeg_Green: "5+", FruitsVeg_Yellow: "3-4", FruitsVeg_Red: "0-2",
      WholeFoods_Green: "80%+", WholeFoods_Yellow: "60-70%", WholeFoods_Red: "0-50%",
      UPF_Green: "0-20%", UPF_Yellow: "30-40%", UPF_Red: "50%+",
      SugaryDrinks_Green: "0", SugaryDrinks_Yellow: "1", SugaryDrinks_Red: "2+"
    },
    "6th - 8th": {
      Water_Green: "8+", Water_Yellow: "7", Water_Red: "0-6",
      FruitsVeg_Green: "5+", FruitsVeg_Yellow: "3-4", FruitsVeg_Red: "0-2",
      WholeFoods_Green: "80%+", WholeFoods_Yellow: "60-70%", WholeFoods_Red: "0-50%",
      UPF_Green: "0-20%", UPF_Yellow: "30-40%", UPF_Red: "50%+",
      SugaryDrinks_Green: "0-1", SugaryDrinks_Yellow: "2", SugaryDrinks_Red: "3+"
    },
    "9th - 12th": {
      Water_Green: "9+", Water_Yellow: "8", Water_Red: "0-7",
      FruitsVeg_Green: "5+", FruitsVeg_Yellow: "3-4", FruitsVeg_Red: "0-2",
      WholeFoods_Green: "80%+", WholeFoods_Yellow: "60-70%", WholeFoods_Red: "0-50%",
      UPF_Green: "0-20%", UPF_Yellow: "30-40%", UPF_Red: "50%+",
      SugaryDrinks_Green: "0-1", SugaryDrinks_Yellow: "2", SugaryDrinks_Red: "3+"
    }
  }
};

export const LOOKUP_3 = {
  title: "Lookup 3",
  columns: [
    "Grade", "Sleep_Green", "Sleep_Yellow", "Sleep_Red",
    "Teeth_Green", "Teeth_Yellow", "Teeth_Red",
    "PA_Green", "PA_Yellow", "PA_Red",
    "Outdoor_Green", "Outdoor_Yellow", "Outdoor_Red",
    "Reading_Green", "Reading_Yellow", "Reading_Red",
    "Screen_Green", "Screen_Yellow", "Screen_Red"
  ],
  rows: {
    "K - 5th": {
      Sleep_Green: "9+", Sleep_Yellow: "8", Sleep_Red: "0-7",
      Teeth_Green: "2+", Teeth_Yellow: "1", Teeth_Red: "0",
      PA_Green: "60+", PA_Yellow: "30-45", PA_Red: "0-15",
      Outdoor_Green: "60+", Outdoor_Yellow: "30-45", Outdoor_Red: "0-15",
      Reading_Green: "20+", Reading_Yellow: "10-15", Reading_Red: "0-5",
      Screen_Green: "<120", Screen_Yellow: "120-180", Screen_Red: "180+"
    },
    "6th - 8th": {
      Sleep_Green: "8+", Sleep_Yellow: "7", Sleep_Red: "0-6",
      Teeth_Green: "X", Teeth_Yellow: "X", Teeth_Red: "X",
      PA_Green: "60+", PA_Yellow: "30-45", PA_Red: "0-15",
      Outdoor_Green: "60+", Outdoor_Yellow: "30-45", Outdoor_Red: "0-15",
      Reading_Green: "X", Reading_Yellow: "X", Reading_Red: "X",
      Screen_Green: "X", Screen_Yellow: "X", Screen_Red: "X"
    },
    "9th - 12th": {
      Sleep_Green: "8+", Sleep_Yellow: "7", Sleep_Red: "0-6",
      Teeth_Green: "X", Teeth_Yellow: "X", Teeth_Red: "X",
      PA_Green: "60+", PA_Yellow: "30-45", PA_Red: "0-15",
      Outdoor_Green: "60+", Outdoor_Yellow: "30-45", Outdoor_Red: "0-15",
      Reading_Green: "X", Reading_Yellow: "X", Reading_Red: "X",
      Screen_Green: "X", Screen_Yellow: "X", Screen_Red: "X"
    }
  }
};

// --- Types & Interfaces ---
export type HabitKey =
  | 'sleep'
  | 'physicalActivity'
  | 'water'
  | 'fruitsVeg'
  | 'wholeFoods'
  | 'upf'
  | 'sugaryDrinks'
  | 'mood';

export interface DailyEntry {
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

export interface UserData {
  username: string;
  role: 'Teacher' | 'Student';
  grade?: 'K - 5th' | '6th - 8th' | '9th - 12th' | '';
  classroomCode: string;
  entries: Record<string, DailyEntry>;
}

interface HabitConfig {
  key: HabitKey;
  label: string;
  icon: string | React.ReactNode;
  options: { label: string; value: number }[];
  goal: string;
  getColor: (val: number) => 'red' | 'yellow' | 'green';
}

export default function App() {
  // Navigation & Auth State
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'home' | 'log' | 'view'>('login');
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

  // Log Data Inputs (Default states for 8 habits)
  const [logData, setLogData] = useState<Record<HabitKey, number>>({
    sleep: 0,
    physicalActivity: 0,
    water: 0,
    fruitsVeg: 0,
    wholeFoods: 0,
    upf: 0,
    sugaryDrinks: 0,
    mood: 1
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

  // Helper: Get Grade for Current User (Edit 15 requirement) 
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

  // Helper: Get Habit Configuration based on Grade (Edit 15 specifications) 
  const getHabitConfigs = (gradeStr: string): HabitConfig[] => {
    const isK5 = gradeStr === 'K - 5th';
    const is68 = gradeStr === '6th - 8th';

    return [
      {
        key: 'sleep',
        label: 'Sleep',
        icon: '💤',
        options: isK5
          ? Array.from({ length: 13 }, (_, i) => ({ label: i === 12 ? '12+' : `${i}`, value: i }))
          : Array.from({ length: 11 }, (_, i) => ({ label: i === 10 ? '10+' : `${i}`, value: i })),
        goal: isK5 ? '9 - 12 hours / night' : '8 - 10 hours / night',
        getColor: (val) => {
          if (isK5) {
            if (val >= 9) return 'green';
            if (val === 8) return 'yellow';
            return 'red';
          } else {
            if (val >= 8) return 'green';
            if (val === 7) return 'yellow';
            return 'red';
          }
        }
      },
      {
        key: 'physicalActivity',
        label: 'Physical Activity',
        icon: '🏃',
        options: [0, 15, 30, 45, 60].map((v) => ({ label: v === 60 ? '60+' : `${v}`, value: v })),
        goal: '60+ minutes / day',
        getColor: (val) => {
          if (val >= 60) return 'green';
          if (val === 45) return 'yellow';
          return 'red';
        }
      },
      {
        key: 'water',
        label: 'Water',
        icon: '💧',
        options: isK5
          ? Array.from({ length: 10 }, (_, i) => ({ label: i === 9 ? '9+' : `${i}`, value: i }))
          : is68
          ? Array.from({ length: 12 }, (_, i) => ({ label: i === 11 ? '11+' : `${i}`, value: i }))
          : Array.from({ length: 14 }, (_, i) => ({ label: i === 13 ? '13+' : `${i}`, value: i })),
        goal: isK5 ? '6 - 9 cups / day' : is68 ? '8 - 11 cups / day' : '9 - 13 cups / day',
        getColor: (val) => {
          if (isK5) {
            if (val >= 6) return 'green';
            if (val === 5) return 'yellow';
            return 'red';
          } else if (is68) {
            if (val >= 8) return 'green';
            if (val === 7) return 'yellow';
            return 'red';
          } else {
            if (val >= 9) return 'green';
            if (val === 8) return 'yellow';
            return 'red';
          }
        }
      },
      {
        key: 'fruitsVeg',
        label: 'Fruits & Vegetables',
        icon: '🥗',
        options: Array.from({ length: 6 }, (_, i) => ({ label: i === 5 ? '5+' : `${i}`, value: i })),
        goal: '>= 5 servings / day',
        getColor: (val) => {
          if (val >= 5) return 'green';
          if (val === 4) return 'yellow';
          return 'red';
        }
      },
      {
        key: 'wholeFoods',
        label: 'Whole Foods',
        icon: '🍎',
        options: [0, 10, 20, 30, 40, 50, 60, 70, 80].map((v) => ({ label: v === 80 ? '80+' : `${v}`, value: v })),
        goal: '>= 80% / day',
        getColor: (val) => {
          if (val >= 80) return 'green';
          if (val === 70) return 'yellow';
          return 'red';
        }
      },
      {
        key: 'upf',
        label: 'Ultra-Processed Foods',
        icon: '🍔',
        options: [0, 10, 20, 30, 40].map((v) => ({ label: v === 40 ? '40+' : `${v}`, value: v })),
        goal: '<= 20% / day',
        getColor: (val) => {
          if (val <= 20) return 'green';
          if (val === 30) return 'yellow';
          return 'red';
        }
      },
      {
        key: 'sugaryDrinks',
        label: 'Sugary Drinks',
        icon: '🥤',
        options: isK5
          ? [{ label: '0', value: 0 }, { label: '1+', value: 1 }]
          : [{ label: '0', value: 0 }, { label: '1', value: 1 }, { label: '2+', value: 2 }],
        goal: isK5 ? '0 drinks / day' : '0 - 1 drinks / day',
        getColor: (val) => {
          if (isK5) {
            return val === 0 ? 'green' : 'red';
          } else {
            return val <= 1 ? 'green' : 'red';
          }
        }
      },
      {
        key: 'mood',
        label: 'Mood',
        icon: <span style={{ color: '#D4AC0D' }}>⭐</span>,
        options: [{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }],
        goal: '3 stars',
        getColor: (val) => {
          if (val >= 3) return 'green';
          if (val === 2) return 'yellow';
          return 'red';
        }
      }
    ];
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

    const newEntries = {
      ...(user.entries || {}),
      [todayISO]: { date: todayISO, ...logData }
    };

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

  const getWeeklyAverage = (key: HabitKey) => {
    const entries = getUserEntries();
    if (entries.length === 0) return 0;
    const last7 = entries.slice(-7);
    const valid = last7.map((e) => e[key]).filter((v): v is number => v !== undefined);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / valid.length) * 10) / 10;
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

  const renderStatusIcon = (color: 'red' | 'yellow' | 'green') => {
    if (color === 'green') return <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>;
    if (color === 'yellow') return <span style={{ color: '#D4AC0D', fontWeight: 'bold' }}>●</span>;
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
      width: '100%',
      maxWidth: '420px',
      objectFit: 'contain',
      margin: '0 auto 15px auto',
      display: 'block'
    },
    navLogoImage: {
      width: '100%',
      maxWidth: '200px', // Matches width of navigation buttons per Edit 14
      objectFit: 'contain',
      margin: '0 auto 20px auto',
      display: 'block'
    },
    headerLogoImage: {
      width: '100%',
      maxWidth: '420px', // Same width as login/register per Edit 14
      objectFit: 'contain',
      margin: '0 0 10px 0',
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
          <div style={styles.authContainer}>
            <img src={MAIN_LOGO_URL} alt="HealthyHabitsED Logo" style={styles.mainLogoImage} />
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
          <div style={styles.authContainer}>
            <img src={MAIN_LOGO_URL} alt="HealthyHabitsED Logo" style={styles.mainLogoImage} />
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

  // --- DASHBOARD WRAPPER (Home, Log, View) ---
  const currentUserGrade = getCurrentUserGrade();
  const habitConfigs = getHabitConfigs(currentUserGrade);

  return (
    <div style={styles.appContainer}>
      <div style={styles.dashboardLayout}>
        <div style={styles.sidebar}>
          <img src={NAV_LOGO_URL} alt="HealthyHabitsED Logo" style={styles.navLogoImage} />

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
            <img src={MAIN_LOGO_URL} alt="HealthyHabitsED Logo" style={styles.headerLogoImage} />

            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px' }}>
              My Grade: {currentUserGrade}
            </div>
            <div style={{ color: charBlack, fontFamily: manropeFont, fontSize: '16px' }}>
              Today's Date: {getTodayESTFormatted()}
            </div>
          </div>

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
                  {habitConfigs.map((cfg) => {
                    const avg = getWeeklyAverage(cfg.key);
                    const color = cfg.getColor(avg);
                    const fontColor = color === 'yellow' ? '#D4AC0D' : color;

                    return (
                      <tr key={cfg.key}>
                        <td style={styles.logTableCell}>
                          <span style={{ marginRight: '8px' }}>{cfg.icon}</span>
                          {cfg.label}
                        </td>
                        <td style={styles.logTableCell}>{cfg.goal}</td>
                        <td style={{ ...styles.logTableCell, color: fontColor, fontWeight: 'bold' }}>
                          {avg} <span style={{ marginLeft: '10px' }}>{renderStatusIcon(color)}</span>
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
                    {habitConfigs.map((cfg) => (
                      <tr key={cfg.key}>
                        <td style={styles.logTableCell}>
                          <span style={{ marginRight: '8px' }}>{cfg.icon}</span>
                          {cfg.label}
                        </td>
                        <td style={styles.logTableCell}>
                          <select
                            value={logData[cfg.key]}
                            onChange={(e) =>
                              setLogData({ ...logData, [cfg.key]: Number(e.target.value) })
                            }
                            style={{ ...styles.inputBox, width: '120px' }}
                          >
                            {cfg.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.logTableCell}>{cfg.goal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button type="submit" style={{ ...styles.button, width: '200px', marginTop: '20px' }}>
                  Submit
                </button>
              </form>

              {logSuccessMsg && (
                <div style={{ color: 'green', marginTop: '10px', fontWeight: 'bold', fontFamily: manropeFont }}>
                  {logSuccessMsg}
                </div>
              )}
            </div>
          )}

          {/* View My Daily Data Page */}
          {currentPage === 'view' && (
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ color: steelBlue, fontFamily: manropeFont }}>View My Daily Data (4-Week)</h2>

              {/* Edit 13 & 15: Dropdown with Habit and Goal */}
              <div style={{ marginBottom: '20px', fontSize: '16px', fontFamily: manropeFont }}>
                <span style={{ color: steelBlue, fontWeight: 'bold' }}>Habit: </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as HabitKey)}
                  style={{ ...styles.inputBox, width: '220px', display: 'inline-block', margin: '0 15px 0 5px', color: charBlack }}
                >
                  {habitConfigs.map((cfg) => (
                    <option key={cfg.key} value={cfg.key} style={{ color: charBlack }}>
                      {cfg.label}, {cfg.goal}
                    </option>
                  ))}
                </select>

                <span style={{ color: steelBlue, fontWeight: 'bold' }}>Goal: </span>
                <span style={{ color: charBlack }}>
                  {habitConfigs.find((c) => c.key === selectedCategory)?.goal}
                </span>
              </div>

              {/* 28-Day Calendar Grid */}
              <div style={styles.gridTable}>
                {get28DayGrid().map(({ dateStr, entry }) => {
                  const val = entry ? entry[selectedCategory] : undefined;
                  const currentCfg = habitConfigs.find((c) => c.key === selectedCategory);
                  
                  let fontColor = charBlack;
                  if (val !== undefined && currentCfg) {
                    const color = currentCfg.getColor(val);
                    fontColor = color === 'yellow' ? '#D4AC0D' : color;
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