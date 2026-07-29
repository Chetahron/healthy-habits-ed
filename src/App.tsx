import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
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

interface SurveyResponse {
  studentUsername: string;
  classroomCode: string;
  hardestHabit: string;
  difficulties: string[];
  resourcesOfInterest: string[];
  effects: string[];
  wantsMoreTips: string;
}

export default function App() {
  // Navigation & Auth State
  const [currentPage, setCurrentPage] = useState<string>('classroom');
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('healthy_habits_current_user') || null;
  });

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
    sleep: 8,
    physicalActivity: 60,
    water: 8,
    fruitsVeg: 5,
    wholeFoods: 80,
    upf: 20,
    sugaryDrinks: 0,
    mood: 3,
  });
  const [logSuccessMsg, setLogSuccessMsg] = useState('');

  // View Data State
  const [selectedCategory, setSelectedCategory] = useState<HabitKey>('water');

  // Survey Form State
  const [studentSurvey, setStudentSurvey] = useState<SurveyResponse>({
    studentUsername: '',
    classroomCode: '',
    hardestHabit: '',
    difficulties: [],
    resourcesOfInterest: [],
    effects: [],
    wantsMoreTips: '',
  });
  const [surveySuccessMsg, setSurveySuccessMsg] = useState('');

  // --- Database & Firebase Sync Setup ---
  const [usersDb, setUsersDb] = useState<Record<string, UserData>>(() => {
    try {
      const saved = localStorage.getItem('healthy_habits_users_db');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);

  const saveDb = async (updatedDb: Record<string, UserData>) => {
    setUsersDb(updatedDb);
    localStorage.setItem('healthy_habits_users_db', JSON.stringify(updatedDb));
    // Sync user database to Firestore cloud in real-time
    try {
      await setDoc(doc(db, 'appData', 'usersDb'), { data: updatedDb });
    } catch (err) {
      console.error('Cloud sync error for usersDb:', err);
    }
  };

  // Real-time Firebase listeners for Cloud Sync
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(doc(db, 'appData', 'usersDb'), (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data()?.data;
        if (cloudData) {
          setUsersDb(cloudData);
          localStorage.setItem('healthy_habits_users_db', JSON.stringify(cloudData));
        }
      }
    });

    const unsubscribeSurveys = onSnapshot(collection(db, 'surveys'), (snapshot) => {
      const fetchedSurveys: SurveyResponse[] = [];
      snapshot.forEach((docItem) => {
        fetchedSurveys.push(docItem.data() as SurveyResponse);
      });
      if (fetchedSurveys.length > 0) {
        setSurveyData(fetchedSurveys);
      }
    });

    return () => {
      unsubscribeUsers();
      unsubscribeSurveys();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('healthy_habits_current_user', currentUser);
      // Pre-fill survey username and classroom code
      if (usersDb[currentUser]) {
        setStudentSurvey(prev => ({
          ...prev,
          studentUsername: currentUser,
          classroomCode: usersDb[currentUser].classroomCode || ''
        }));
      }
    } else {
      localStorage.removeItem('healthy_habits_current_user');
    }
  }, [currentUser, usersDb]);

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

  // User & Classroom Lookup Helpers
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

  const getCurrentUserRole = (): 'Teacher' | 'Student' | 'N/A' => {
    if (!currentUser || !usersDb[currentUser]) return 'N/A';
    return usersDb[currentUser].role || 'N/A';
  };

  const getCurrentUserClassroomCode = (): string => {
    if (!currentUser || !usersDb[currentUser]) return 'N/A';
    return usersDb[currentUser].classroomCode || 'N/A';
  };

  // Habit Configs & Grading Logic
  const getHabitsConfig = (grade: string): HabitConfig[] => {
    if (grade === 'K - 5th') {
      return [
        { key: 'sleep', label: 'Sleep', icon: '😴', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], selectionLabels: { 12: '12+' }, goal: '9 - 12 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], selectionLabels: { 9: '9+' }, goal: '6 - 9 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🧃', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 drinks / day' },
        { key: 'mood', label: 'Mood', icon: '⭐', selections: [1, 2, 3], goal: '3 stars' },
      ];
    } else {
      return [
        { key: 'sleep', label: 'Sleep', icon: '😴', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], selectionLabels: { 10: '10+' }, goal: '8 - 10 hours / night' },
        { key: 'physicalActivity', label: 'Physical Activity', icon: '🏃', selections: [0, 15, 30, 45, 60], selectionLabels: { 60: '60+' }, goal: '60+ minutes / day' },
        { key: 'water', label: 'Water', icon: '💧', selections: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], selectionLabels: { 11: '11+' }, goal: '8 - 11 cups / day' },
        { key: 'fruitsVeg', label: 'Fruits & Vegetables', icon: '🍎', selections: [0, 1, 2, 3, 4, 5], selectionLabels: { 5: '5+' }, goal: '>= 5 servings / day' },
        { key: 'wholeFoods', label: 'Whole Foods', icon: '🥗', selections: [0, 10, 20, 30, 40, 50, 60, 70, 80], selectionLabels: { 80: '80+' }, goal: '>= 80% / day' },
        { key: 'upf', label: 'Ultra-Processed Foods', icon: '🍔', selections: [0, 10, 20, 30, 40], selectionLabels: { 40: '40+' }, goal: '<= 20% / day' },
        { key: 'sugaryDrinks', label: 'Sugary Drinks', icon: '🧃', selections: [0, 1, 2], selectionLabels: { 2: '2+' }, goal: '0 - 1 drinks / day' },
        { key: 'mood', label: 'Mood', icon: '⭐', selections: [1, 2, 3], goal: '3 stars' },
      ];
    }
  };

  const getHabitColor = (key: HabitKey, val: number, grade: string): 'red' | 'yellow' | 'green' => {
    if (grade === 'K - 5th') {
      switch (key) {
        case 'sleep': return val >= 9 ? 'green' : val === 8 ? 'yellow' : 'red';
        case 'physicalActivity': return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water': return val >= 6 ? 'green' : val === 5 ? 'yellow' : 'red';
        case 'fruitsVeg': return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods': return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf': return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'sugaryDrinks': return val === 0 ? 'green' : val === 1 ? 'yellow' : 'red';
        case 'mood': return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
      }
    } else {
      switch (key) {
        case 'sleep': return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'physicalActivity': return val >= 60 ? 'green' : val === 45 ? 'yellow' : 'red';
        case 'water': return val >= 8 ? 'green' : val === 7 ? 'yellow' : 'red';
        case 'fruitsVeg': return val >= 5 ? 'green' : val === 4 ? 'yellow' : 'red';
        case 'wholeFoods': return val >= 80 ? 'green' : val === 70 ? 'yellow' : 'red';
        case 'upf': return val <= 20 ? 'green' : val === 30 ? 'yellow' : 'red';
        case 'sugaryDrinks': return val === 0 ? 'green' : val === 1 ? 'yellow' : 'red';
        case 'mood': return val >= 3 ? 'green' : val === 2 ? 'yellow' : 'red';
      }
    }
    return 'green';
  };

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
      setLoginError('The username you entered has not yet been registered. Please register first.');
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

    const updatedDb = {
      ...usersDb,
      [currentUser]: { ...user, entries: newEntries }
    };
    saveDb(updatedDb);
    setLogSuccessMsg('Data logged and synced to cloud successfully!');
    setTimeout(() => setLogSuccessMsg(''), 3000);
  };

  const handleCheckboxChange = (field: keyof SurveyResponse, value: string) => {
    setStudentSurvey((prev) => {
      const currentArr = (prev[field] as string[]) || [];
      const updatedArr = currentArr.includes(value)
        ? currentArr.filter((item) => item !== value)
        : [...currentArr, value];
      return { ...prev, [field]: updatedArr };
    });
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSurvey = {
      ...studentSurvey,
      studentUsername: currentUser || 'Anonymous',
      classroomCode: getCurrentUserClassroomCode()
    };

    try {
      const docId = `survey_${currentUser || 'anon'}_${Date.now()}`;
      await setDoc(doc(db, 'surveys', docId), finalSurvey);
      setSurveySuccessMsg('Thank you! Your survey responses have been submitted to Cloud Firestore.');
      setTimeout(() => setSurveySuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error submitting survey to cloud:', err);
      alert('Failed to submit survey. Please check connection.');
    }
  };

  const getAnswerCount = (category: keyof SurveyResponse, answerText: string) => {
    const code = getCurrentUserClassroomCode().trim().toLowerCase();
    return surveyData.filter((resp) => {
      if ((resp.classroomCode || '').trim().toLowerCase() !== code) return false;
      const val = resp[category];
      if (Array.isArray(val)) {
        return val.includes(answerText);
      }
      return val === answerText;
    }).length;
  };

  // Calculation Helpers
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
    return Math.round(studentAveragesSum / countedStudents);
  };

  const getClassroomStudentList = () => {
    const code = getCurrentUserClassroomCode().trim().toLowerCase();
    if (code === 'n/a') return [];
    return Object.values(usersDb).filter(
      (u) => (u.classroomCode || '').trim().toLowerCase() === code
    );
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
      boxSizing: 'border-box'
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
      boxSizing: 'border-box'
    },
    sidebarLogoImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '80px',
      objectFit: 'contain',
      display: 'block'
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
      boxSizing: 'border-box'
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
    pageTopRightInfo: {
      fontSize: 'smaller',
      textAlign: 'right' as const,
      marginBottom: '15px',
      fontFamily: manropeFont,
      color: charBlack
    },
    statusItemLabel: {
      fontWeight: 'bold'
    }
  };

  // --- LOGIN PAGE ---
  if (!currentUser && currentPage === 'login') {
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
  if (!currentUser && currentPage === 'register') {
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

  // --- DASHBOARD / MAIN APP WRAPPER ---
  const currentGrade = getCurrentUserGrade();
  const habitsConfig = getHabitsConfig(currentGrade);
  const classroomMembers = getClassroomStudentList();

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
        {getCurrentUserRole() === 'Teacher' && (
          <button
            style={{
              ...styles.navButton,
              ...(currentPage === 'survey-results' ? styles.activeNavButton : {})
            }}
            onClick={() => setCurrentPage('survey-results')}
          >
            Survey Results
          </button>
        )}
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

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
          <img src={logo} alt="HealthyHabitsED Logo" style={styles.headerLogoImage} />
          <div style={styles.pageTopRightInfo}>
            <div><span style={styles.statusItemLabel}>My Status:</span> {getCurrentUserRole()}</div>
            <div><span style={styles.statusItemLabel}>My Classroom:</span> {getCurrentUserClassroomCode()}</div>
            <div><span style={styles.statusItemLabel}>My Grade:</span> {currentGrade}</div>
            <div><span style={styles.statusItemLabel}>Today's Date:</span> {getTodayESTFormatted()}</div>
          </div>
        </div>

        {/* Classroom Scorecard View */}
        {currentPage === 'classroom' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>My Classroom Scorecard</h2>
            <p>Welcome back, <strong>{currentUser}</strong>! Here is your classroom overview and collective progress (Synced Live via Cloud).</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
              <div style={{ background: '#FFFFFF', padding: '15px', borderRadius: '8px', borderLeft: `4px solid ${steelBlue}` }}>
                <div style={{ fontSize: '13px', color: '#666' }}>Classroom Code</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: steelBlue }}>{getCurrentUserClassroomCode()}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '15px', borderRadius: '8px', borderLeft: `4px solid #4CAF50` }}>
                <div style={{ fontSize: '13px', color: '#666' }}>Classroom Grade Level</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>{currentGrade}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '15px', borderRadius: '8px', borderLeft: `4px solid #FF9800` }}>
                <div style={{ fontSize: '13px', color: '#666' }}>Active Classroom Members</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF9800' }}>{classroomMembers.length} Users</div>
              </div>
            </div>

            <h3 style={{ color: steelBlue, marginTop: '30px', marginBottom: '15px' }}>Classroom Habit Weekly Averages</h3>
            <table style={styles.logTable}>
              <thead>
                <tr style={{ background: '#EAE5D9' }}>
                  <th style={styles.logTableHeaderCell}>Habit</th>
                  <th style={styles.logTableHeaderCell}>Class Average (Last 7 Days)</th>
                  <th style={styles.logTableHeaderCell}>Target Goal</th>
                </tr>
              </thead>
              <tbody>
                {habitsConfig.map((h) => {
                  const avg = getClassroomWeeklyAverage(h.key);
                  return (
                    <tr key={h.key} style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={styles.logTableCell}>{h.icon} {h.label}</td>
                      <td style={styles.logTableCell}>{avg}</td>
                      <td style={styles.logTableCell}>{h.goal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Scorecard / Home View */}
        {currentPage === 'home' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>My Personal Scorecard</h2>
            <p>Track your 7-day rolling averages and daily consistency.</p>
            <table style={styles.logTable}>
              <thead>
                <tr style={{ background: '#EAE5D9' }}>
                  <th style={styles.logTableHeaderCell}>Habit</th>
                  <th style={styles.logTableHeaderCell}>7-Day Average</th>
                  <th style={styles.logTableHeaderCell}>Status</th>
                  <th style={styles.logTableHeaderCell}>Goal</th>
                </tr>
              </thead>
              <tbody>
                {habitsConfig.map((h) => {
                  const avg = getWeeklyAverage(h.key);
                  return (
                    <tr key={h.key} style={{ borderBottom: '1px solid #DDD' }}>
                      <td style={styles.logTableCell}>{h.icon} {h.label}</td>
                      <td style={styles.logTableCell}>{avg}</td>
                      <td style={styles.logTableCell}>{renderStatusIcon(h.key, avg, currentGrade)}</td>
                      <td style={styles.logTableCell}>{h.goal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Daily Data Log View */}
        {currentPage === 'log' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>Log Daily Data ({getTodayESTFormatted()})</h2>
            {logSuccessMsg && <div style={{ color: 'green', fontWeight: 'bold', marginBottom: '10px' }}>{logSuccessMsg}</div>}
            <form onSubmit={handleLogSubmit} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {habitsConfig.map((h) => (
                <label key={h.key} style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold', fontSize: '14px' }}>
                  {h.icon} {h.label} (Goal: {h.goal}):
                  <select
                    value={logFormValues[h.key]}
                    onChange={(e) => setLogFormValues({ ...logFormValues, [h.key]: Number(e.target.value) })}
                    style={{ padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    {h.selections.map((sel) => (
                      <option key={sel} value={sel}>
                        {h.selectionLabels && h.selectionLabels[sel] ? h.selectionLabels[sel] : sel}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <button type="submit" style={styles.button}>Save & Sync Daily Log</button>
            </form>
          </div>
        )}

        {/* Daily Data View (28-day grid) */}
        {currentPage === 'view' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>My Daily Data View</h2>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Select Habit:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as HabitKey)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                {habitsConfig.map((h) => (
                  <option key={h.key} value={h.key}>{h.label}</option>
                ))}
              </select>
              <span style={{ fontSize: '13px', color: '#555' }}>
                Goal: {habitsConfig.find((h) => h.key === selectedCategory)?.goal}
              </span>
            </div>

            <div style={styles.gridTable}>
              {get28DayGrid().map(({ dateStr, entry }, idx) => {
                const val = entry ? entry[selectedCategory] : undefined;
                let bg = '#FFFFFF';
                if (val !== undefined) {
                  const status = getHabitColor(selectedCategory, val, currentGrade);
                  if (status === 'green') bg = '#D4EFDF';
                  else if (status === 'yellow') bg = '#FCF3CF';
                  else bg = '#FADBD8';
                }
                const [y, m, d] = dateStr.split('-');
                return (
                  <div key={idx} style={{ ...styles.gridCell, backgroundColor: bg }}>
                    <div style={{ fontSize: '11px', color: '#666' }}>{m}/{d}/{y}</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>
                      {val !== undefined ? val : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Learning Center */}
        {currentPage === 'learning' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>Learning Center</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#FFFFFF', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: steelBlue, margin: '0 0 5px 0' }}>💡 Why Sleep Matters</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>Getting 8-10 hours of quality sleep helps your brain grow, boosts memory, and keeps your energy high throughout the school day!</p>
              </div>
              <div style={{ background: '#FFFFFF', padding: '15px', borderRadius: '8px' }}>
                <h4 style={{ color: steelBlue, margin: '0 0 5px 0' }}>💧 Stay Hydrated</h4>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>Drinking enough water helps concentration, physical performance, and overall well-being.</p>
              </div>
            </div>
          </div>
        )}

        {/* Community Resources */}
        {currentPage === 'resources' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>Community Resources</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>Explore trusted local and national wellness programs and support networks:</p>
            <a href="https://www.cdc.gov/healthyschools/index.htm" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
              CDC Healthy Schools Initiative
            </a>
            <a href="https://www.nutrition.gov" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>
              Nutrition.gov Guidelines & Resources
            </a>
          </div>
        )}

        {/* Feedback Survey */}
        {currentPage === 'survey' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>Student Healthy Habits Survey</h2>
            {surveySuccessMsg && <div style={{ color: 'green', fontWeight: 'bold', marginBottom: '10px' }}>{surveySuccessMsg}</div>}
            <form onSubmit={handleSurveySubmit} style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFF', padding: '25px', borderRadius: '8px' }}>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>1. Which healthy habit is the hardest for you to practice consistently?</p>
                {[
                  'Getting enough sleep',
                  'Drinking enough water',
                  'Eating fruits and vegetables',
                  'Being physically active',
                  'Limiting sugary drinks or ultra-processed foods',
                  'Nothing in particular right now',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="hardestHabit"
                      value={opt}
                      checked={studentSurvey.hardestHabit === opt}
                      onChange={(e) => setStudentSurvey({ ...studentSurvey, hardestHabit: e.target.value })}
                    />{' '}
                    {opt}
                  </label>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>2. What makes healthy habits difficult for you? (Select all that apply)</p>
                {[
                  "I don't have enough time",
                  'Healthy foods or activities cost too much',
                  "I don't have transportation",
                  'I have too much homework or other responsibilities',
                  "I don't have a safe place to be active",
                  "I don't know where to find healthy resources",
                  'Something else',
                  'Nothing in particular right now',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={studentSurvey.difficulties.includes(opt)}
                      onChange={() => handleCheckboxChange('difficulties', opt)}
                    />{' '}
                    {opt}
                  </label>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>3. Which free community resources would you like to learn more about? (Select all that apply)</p>
                {[
                  'Free student meals',
                  'Food pantries',
                  'Recreation centers',
                  'Parks, playgrounds, and trails',
                  'Youth sports',
                  'Homework help or tutoring',
                  'Mentoring programs',
                  'None right now',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={studentSurvey.resourcesOfInterest.includes(opt)}
                      onChange={() => handleCheckboxChange('resourcesOfInterest', opt)}
                    />{' '}
                    {opt}
                  </label>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>4. How has practicing healthy habits affected you this month? (Select all that apply)</p>
                {[
                  'I have more energy',
                  'I can focus better in class',
                  'I’m sleeping better or more',
                  'My mood has improved',
                  'I feel stronger or more active',
                  'I haven’t noticed a difference, yet',
                ].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={studentSurvey.effects.includes(opt)}
                      onChange={() => handleCheckboxChange('effects', opt)}
                    />{' '}
                    {opt}
                  </label>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>5. Would you like more healthy habit tips and local resources?</p>
                {['Yes', 'Maybe later', 'No thanks'].map((opt) => (
                  <label key={opt} style={{ display: 'block', marginBottom: '5px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="wantsMoreTips"
                      value={opt}
                      checked={studentSurvey.wantsMoreTips === opt}
                      onChange={(e) => setStudentSurvey({ ...studentSurvey, wantsMoreTips: e.target.value })}
                    />{' '}
                    {opt}
                  </label>
                ))}
              </div>

              <button type="submit" style={styles.button}>Submit Survey to Cloud</button>
            </form>
          </div>
        )}

        {/* Survey Results (Teacher View) */}
        {currentPage === 'survey-results' && getCurrentUserRole() === 'Teacher' && (
          <div>
            <h2 style={{ color: steelBlue, fontSize: '22px', marginBottom: '15px' }}>Classroom Survey Results</h2>
            <p style={{ color: '#555', marginBottom: '20px' }}>Aggregated feedback submitted by students in classroom: <strong>{getCurrentUserClassroomCode()}</strong></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: steelBlue }}>Top Hardest Habits:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                  <li>Getting enough sleep: <strong>{getAnswerCount('hardestHabit', 'Getting enough sleep')} responses</strong></li>
                  <li>Drinking enough water: <strong>{getAnswerCount('hardestHabit', 'Drinking enough water')} responses</strong></li>
                  <li>Being physically active: <strong>{getAnswerCount('hardestHabit', 'Being physically active')} responses</strong></li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: steelBlue }}>Common Obstacles Identified:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                  <li>Not enough time: <strong>{getAnswerCount('difficulties', "I don't have enough time")} responses</strong></li>
                  <li>Too much homework / responsibilities: <strong>{getAnswerCount('difficulties', 'I have too much homework or other responsibilities')} responses</strong></li>
                  <li>No safe place to be active: <strong>{getAnswerCount('difficulties', "I don't have a safe place to be active")} responses</strong></li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: steelBlue }}>Requested Resources:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
                  <li>Free student meals: <strong>{getAnswerCount('resourcesOfInterest', 'Free student meals')} responses</strong></li>
                  <li>Parks & trails: <strong>{getAnswerCount('resourcesOfInterest', 'Parks, playgrounds, and trails')} responses</strong></li>
                  <li>Homework help / Tutoring: <strong>{getAnswerCount('resourcesOfInterest', 'Homework help or tutoring')} responses</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}