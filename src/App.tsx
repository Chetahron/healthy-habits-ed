import React, { useState, useEffect } from 'react';
import logo from './assets/logo.png';
import sidebarLogo from './assets/new-sidebar-logo.png';

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
  date: string;
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
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'classroom' | 'home' | 'log' | 'view' | 'learning' | 'resources' | 'survey'>('login');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regRole, setRegRole] = useState<'Teacher' | 'Student' | ''>('');
  const [regGrade, setRegGrade] = useState<'K - 5th' | '6th - 8th' | '9th - 12th' | ''>('');
  const [regUsername, setRegUsername] = useState('');
  const [regClassroomCode, setRegClassroomCode] = useState('');

  const [regFormatError, setRegFormatError] = useState(false);
  const [regTakenError, setRegTakenError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const [gradeError, setGradeError] = useState(false);
  const [codeEmptyError, setCodeEmptyError] = useState(false);
  const [codeCustomError, setCodeCustomError] = useState('');
  const [generalRegError, setGeneralRegError] = useState(false);

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

  const [selectedCategory, setSelectedCategory] = useState<HabitKey>('sleep');

  const [surveyTeacherChallenge, setSurveyTeacherChallenge] = useState('');
  const [surveyStudentHardestHabit, setSurveyStudentHardestHabit] = useState<string[]>([]);
  const [surveyStudentDifficultyReason, setSurveyStudentDifficultyReason] = useState<string[]>([]);
  const [surveyStudentResourceInterest, setSurveyStudentResourceInterest] = useState<string[]>([]);
  const [surveyStudentImpact, setSurveyStudentImpact] = useState('');
  const [surveyStudentMoreTips, setSurveyStudentMoreTips] = useState('');
  const [surveySuccessMsg, setSurveySuccessMsg] = useState('');

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

  const getTodayESTISO = (): string => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  };

  const getTodayESTFormatted = (): string => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).formatToParts(new Date());

    let mm = '', dd = '', yyyy = '';
    for (const p of parts) {
      if (p.type === 'month') mm = p.value;
      if (p.type === 'day') dd = p.value;
      if (p.type === 'year') yyyy = p.value;
    }
    return `${mm}/${dd}/${yyyy}`;
  };

  const formatDateToMDY = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
  };

  const getCurrentUserGrade = (): string => {
    if (!currentUser || !usersDb[currentUser]) return 'N/A';
    const user = usersDb[currentUser];
    if (user.role === 'Teacher' && user.grade) return user.grade;

    const userCode = (user.classroomCode || '').trim().toLowerCase();
    const teacher = Object.values(usersDb).find(
      (u) => u.role === 'Teacher' && (u.classroomCode || '').trim().toLowerCase() === userCode
    );
    return teacher?.grade || user.grade || 'N/A';
  };

  const getCurrentUserRole = (): 'Teacher' | 'Student' => {
    if (!currentUser || !usersDb[currentUser]) return 'Student';
    return usersDb[currentUser].role || 'Student';
  };

  const getCurrentUserClassroomCode = (): string => {
    if (!currentUser || !usersDb[currentUser]) return 'N/A';
    return usersDb[currentUser].classroomCode || 'N/A';
  };

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
    if (key === 'sugaryDrinks') return val === 0 ? 'green' : val === 1 ? 'yellow' : 'red';

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
    const todayEntry = usersDb[currentUser].entries?.[todayISO];
    const userGrade = getCurrentUserGrade();
    const currentHabitsConfig = getHabitsConfig(userGrade);
    const populatedValues: Record<HabitKey, number> = { ...logFormValues };

    currentHabitsConfig.forEach((h) => {
      populatedValues[h.key] = todayEntry?.[h.key] !== undefined ? todayEntry[h.key]! : h.selections[0];
    });
    setLogFormValues(populatedValues);
  }, [currentUser, currentPage, usersDb]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = loginUsername.trim();
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
    const trimmedUser = regUsername.trim();
    const trimmedCode = regClassroomCode.trim();

    setRegFormatError(false);
    setRegTakenError(false);
    setRoleError(false);
    setGradeError(false);
    setCodeEmptyError(false);
    setCodeCustomError('');
    setGeneralRegError(false);

    let hasError = false;

    if (!regRole) { setRoleError(true); hasError = true; }
    if (regRole === 'Teacher' && !regGrade) { setGradeError(true); hasError = true; }
    if (!trimmedUser || !/^[a-zA-Z0-9]{6,12}$/.test(trimmedUser)) { setRegFormatError(true); hasError = true; }
    if (usersDb[trimmedUser]) { setRegTakenError(true); hasError = true; }

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

    if (hasError) { setGeneralRegError(true); return; }

    const newUser: UserData = {
      username: trimmedUser,
      role: regRole as 'Teacher' | 'Student',
      grade: regRole === 'Teacher' ? regGrade : '',
      classroomCode: trimmedCode,
      entries: {}
    };

    saveDb({ ...usersDb, [trimmedUser]: newUser });
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
    const newEntries = { ...(user.entries || {}), [todayISO]: { date: todayISO, ...logFormValues } };

    const sortedKeys = Object.keys(newEntries).sort();
    if (sortedKeys.length > 28) {
      sortedKeys.slice(0, sortedKeys.length - 28).forEach((k) => delete newEntries[k]);
    }

    saveDb({ ...usersDb, [currentUser]: { ...user, entries: newEntries } });
    setLogSuccessMsg('Data logged successfully!');
    setTimeout(() => setLogSuccessMsg(''), 3000);
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveySuccessMsg('Thank you! Your survey responses have been submitted.');
    setTimeout(() => setSurveySuccessMsg(''), 4000);
  };

  const getUserEntries = (): DailyEntry[] => {
    if (!currentUser || !usersDb[currentUser]) return [];
    return Object.values(usersDb[currentUser].entries || {}).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getWeeklyAverage = (key: HabitKey): number => {
    const entries = getUserEntries();
    if (entries.length === 0) return 0;
    const last7 = entries.slice(-7);
    const validValues = last7.map((e) => e[key]).filter((v): v is number => v !== undefined);
    if (validValues.length === 0) return 0;
    return Math.round(validValues.reduce((acc, curr) => acc + curr, 0) / validValues.length);
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
          studentAveragesSum += validValues.reduce((acc, curr) => acc + curr, 0) / validValues.length;
          countedStudents++;
        }
      }
    });

    if (countedStudents === 0) return 0;
    return Math.round(studentAveragesSum / countedStudents);
  };

  const get28DayGrid = () => {
    const result: { dateStr: string; entry?: DailyEntry }[] = [];
    const [yyyy, mm, dd] = getTodayESTISO().split('-').map(Number);
    const todayESTDate = new Date(yyyy, mm - 1, dd);

    for (let i = 27; i >= 0; i--) {
      const d = new Date(todayESTDate);
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = (currentUser && usersDb[currentUser]?.entries?.[iso]) || undefined;
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

  const steelBlue = '#3E6F9B';
  const cream = '#FCFAF5';
  const charBlack = '#202124';
  const manropeFont = "'Manrope', sans-serif";

  const styles: Record<string, React.CSSProperties> = {
    appContainer: { fontFamily: manropeFont, backgroundColor: cream, color: charBlack, minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    centerHeader: { textAlign: 'center', marginBottom: '20px' },
    mainLogoImage: { maxWidth: '440px', maxHeight: '280px', objectFit: 'contain', margin: '15px auto', display: 'block' },
    headerLogoImage: { maxWidth: '440px', maxHeight: '270px', objectFit: 'contain', margin: '0 0 5px 0', display: 'block' },
    authContainer: { width: '420px', margin: '0 auto', textAlign: 'left' },
    sectionHeadingBlue: { fontFamily: manropeFont, fontSize: '18px', fontWeight: 'bold', color: steelBlue, marginTop: '25px', marginBottom: '6px' },
    inputBox: { width: '100%', padding: '10px', margin: '6px 0', fontFamily: manropeFont, fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', backgroundColor: steelBlue, color: '#FFFFFF', border: 'none', padding: '10px', fontFamily: manropeFont, fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '15px' },
    linkText: { marginTop: '15px', color: charBlack, fontFamily: manropeFont, fontSize: '14px' },
    linkAnchor: { color: steelBlue, cursor: 'pointer', textDecoration: 'underline', fontFamily: manropeFont },
    dashboardLayout: { display: 'flex', flex: 1, minHeight: '100vh' },
    sidebar: { width: '260px', backgroundColor: steelBlue, color: '#FFFFFF', padding: '20px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', boxSizing: 'border-box' },
    sidebarLogoBox: { width: '100%', maxWidth: '110px', backgroundColor: 'transparent', padding: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', boxSizing: 'border-box' },
    sidebarLogoImage: { width: '200%', maxWidth: 'none', height: 'auto', maxHeight: '120px', objectFit: 'contain', display: 'block' },
    navButton: { width: '100%', maxWidth: '220px', backgroundColor: cream, color: charBlack, border: '1px solid transparent', padding: '11px 12px', cursor: 'pointer', fontFamily: manropeFont, fontSize: '14px', fontWeight: 600, textAlign: 'center', borderRadius: '8px', boxSizing: 'border-box' },
    activeNavButton: { backgroundColor: '#EAE5D9', color: steelBlue, border: `2px solid ${steelBlue}`, fontWeight: 'bold' },
    mainContent: { flex: 1, backgroundColor: cream, padding: '30px', color: charBlack },
    gridTable: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: '20px' },
    gridCell: { border: '1px solid #ccc', padding: '10px 5px', textAlign: 'center', borderRadius: '4px', minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '13px', fontFamily: manropeFont },
    logTable: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' },
    logTableCell: { padding: '10px 12px', textAlign: 'left', fontFamily: manropeFont, color: charBlack, fontSize: '15px' },
    logTableHeaderCell: { padding: '10px 12px', textAlign: 'left', fontFamily: manropeFont, color: steelBlue, fontWeight: 'bold', fontSize: '16px' },
    resourceIndentLink: { display: 'block', marginLeft: '20px', color: steelBlue, textDecoration: 'underline', marginBottom: '6px', fontSize: '13px', fontFamily: manropeFont },
    smallContentHeader: { fontSize: '15px', fontWeight: 'bold', margin: '6px 0 3px 0', color: charBlack, fontFamily: manropeFont },
    smallContentText: { fontSize: '13px', margin: '0 0 6px 0', lineHeight: '1.4', color: charBlack, fontFamily: manropeFont },
    halfHeightSpace: { height: '10px' },
    topRightInfoContainer: { fontSize: '14px', color: charBlack, fontFamily: manropeFont, lineHeight: '1.5' },
    topRightInfoLabel: { fontWeight: 'bold' }
  };

  if (currentPage === 'login') {
    return (
      <div style={styles.appContainer}>
        <div style={{ padding: '40px 20px' }}>
          <div style={styles.centerHeader}><img src={logo} alt="Logo" style={styles.mainLogoImage} /></div>
          <div style={styles.authContainer}>
            <h2 style={{ color: charBlack, marginBottom: '5px' }}>Login</h2>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="username" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} style={styles.inputBox} />
              {loginError && <div style={{ color: 'red', fontSize: '13px', marginTop: '4px' }}>{loginError}</div>}
              <button type="submit" style={styles.button}>Login</button>
            </form>
            <div style={styles.linkText}>
              Don’t have an account? <span style={styles.linkAnchor} onClick={() => { setLoginError(''); setCurrentPage('register'); }}>Register now.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'register') {
    return (
      <div style={styles.appContainer}>
        <div style={{ padding: '40px 20px' }}>
          <div style={styles.centerHeader}><img src={logo} alt="Logo" style={styles.mainLogoImage} /></div>
          <div style={styles.authContainer}>
            <h2 style={{ color: charBlack, marginBottom: '5px' }}>Register</h2>
            <form onSubmit={handleRegister}>
              <div style={{ ...styles.sectionHeadingBlue, marginTop: '15px' }}>Are you a teacher or student?</div>
              <div>
                <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                  <input type="radio" name="role" value="Teacher" checked={regRole === 'Teacher'} onChange={() => { setRegRole('Teacher'); setRoleError(false); setGeneralRegError(false); }} /> Teacher
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" name="role" value="Student" checked={regRole === 'Student'} onChange={() => { setRegRole('Student'); setRegGrade(''); setRoleError(false); setGradeError(false); setGeneralRegError(false); }} /> Student
                </label>
                <div style={{ color: roleError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>Please select your role. Required field.</div>
              </div>

              <div style={styles.sectionHeadingBlue}>What grade is your classroom?</div>
              <select value={regGrade} disabled={regRole === 'Student'} onChange={(e) => { setRegGrade(e.target.value as any); setGradeError(false); setGeneralRegError(false); }} style={{ ...styles.inputBox, backgroundColor: regRole === 'Student' ? '#EAEAEA' : '#FFFFFF' }}>
                <option value="">Select Grade Level</option>
                <option value="K - 5th">K - 5th</option>
                <option value="6th - 8th">6th - 8th</option>
                <option value="9th - 12th">9th - 12th</option>
              </select>
              <div style={{ color: gradeError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>Required if teacher.</div>

              <div style={styles.sectionHeadingBlue}>What is your username?</div>
              <input type="text" placeholder="username" value={regUsername} onChange={(e) => { setRegUsername(e.target.value); setRegFormatError(false); setRegTakenError(false); setGeneralRegError(false); }} style={styles.inputBox} />
              <div style={{ color: regFormatError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>6-12 alphanumeric characters.</div>
              {regTakenError && <div style={{ color: 'red', fontSize: '10px' }}>Username already taken.</div>}

              <div style={styles.sectionHeadingBlue}>What is your classroom code?</div>
              <input type="text" placeholder="classroom code" value={regClassroomCode} onChange={(e) => { setRegClassroomCode(e.target.value); setCodeEmptyError(false); setCodeCustomError(''); setGeneralRegError(false); }} style={styles.inputBox} />
              <div style={{ color: codeEmptyError ? 'red' : charBlack, fontSize: '10px', marginTop: '4px' }}>Required.</div>
              {codeCustomError && <div style={{ color: 'red', fontSize: '10px' }}>{codeCustomError}</div>}

              <button type="submit" style={styles.button}>Register</button>
              {generalRegError && <div style={{ color: 'red', fontSize: '13px', marginTop: '8px', fontWeight: 'bold', textAlign: 'center' }}>Please check your registration information.</div>}
            </form>
            <div style={styles.linkText}>
              Already have an account? <span style={styles.linkAnchor} onClick={() => { setRegFormatError(false); setRegTakenError(false); setCurrentPage('login'); }}>Log In Now</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUserGrade = getCurrentUserGrade();
  const currentUserClassroom = getCurrentUserClassroomCode();
  const currentUserRole = getCurrentUserRole();
  const habitsConfig = getHabitsConfig(currentUserGrade);

  return (
    <div style={styles.appContainer}>
      <div style={styles.dashboardLayout}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogoBox}><img src={sidebarLogo} alt="Logo" style={styles.sidebarLogoImage} /></div>
          <button style={{ ...styles.navButton, ...(currentPage === 'classroom' ? styles.activeNavButton : {}) }} onClick={() => setCurrentPage('classroom')}>My Classroom Scorecard</button>
          <button style={{ ...styles.navButton, ...(currentPage === 'home' ? styles.activeNavButton : {}) }} onClick={() => setCurrentPage('home')}>My Scorecard</button>
          <button style={{ ...styles.navButton, ...(currentPage === 'log' ? styles.activeNavButton : {}) }} onClick={() => setCurrentPage('log')}>My Daily Data Log</button>
          <button style={{ ...styles.navButton, ...(currentPage === 'view' ? styles.activeNavButton : {}) }} onClick={() => setCurrentPage('view')}>My Daily Data View</button>
          <button style={{ ...styles.navButton, ...(currentPage === 'learning' ? styles.activeNavButton : {}) }} onClick={() => setCurrentPage('learning')}>Learning Center</button>
          <button style={{ ...styles.navButton, ...(currentPage === 'resources' ? styles.activeNavButton : {}) }} onClick={() => setCurrentPage('resources')}>Community Resources</button>
          <button style={{ ...styles.navButton, ...(currentPage === 'survey' ? styles.activeNavButton : {}) }} onClick={() => setCurrentPage('survey')}>Survey</button>
          <button style={{ ...styles.navButton, marginTop: 'auto', backgroundColor: '#d9534f', color: '#ffffff' }} onClick={() => { setCurrentUser(null); setCurrentPage('login'); }}>Log Out</button>
        </div>

        <div style={styles.mainContent}>
          <div style={{ textAlign: 'left', marginBottom: '25px' }}>
            <img src={logo} alt="Logo" style={styles.headerLogoImage} />
            <div style={styles.topRightInfoContainer}>
              <div><span style={styles.topRightInfoLabel}>My Status:</span> {currentUserRole}</div>
              <div><span style={styles.topRightInfoLabel}>My Classroom:</span> {currentUserClassroom}</div>
              <div><span style={styles.topRightInfoLabel}>My Grade:</span> {currentUserGrade}</div>
              <div><span style={styles.topRightInfoLabel}>Today's Date:</span> {getTodayESTFormatted()}</div>
            </div>
          </div>

          {currentPage === 'classroom' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontSize: '24px', fontWeight: 'bold' }}>My Classroom’s Scorecard (Weekly Average)</h2>
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
                        <td style={styles.logTableCell}>{h.icon} {h.label}</td>
                        <td style={styles.logTableCell}>{h.goal}</td>
                        <td style={styles.logTableCell}>{avg} <span style={{ marginLeft: '10px' }}>{renderStatusIcon(h.key, avg, currentUserGrade)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {currentPage === 'home' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontSize: '24px', fontWeight: 'bold' }}>My Scorecard (Weekly Average)</h2>
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
                        <td style={styles.logTableCell}>{h.icon} {h.label}</td>
                        <td style={styles.logTableCell}>{h.goal}</td>
                        <td style={styles.logTableCell}>{avg} <span style={{ marginLeft: '10px' }}>{renderStatusIcon(h.key, avg, currentUserGrade)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {currentPage === 'log' && (
            <div style={{ textAlign: 'left', maxWidth: '700px' }}>
              <h2 style={{ color: steelBlue, fontSize: '24px', fontWeight: 'bold' }}>My Daily Data Log</h2>
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
                        <td style={styles.logTableCell}>{h.icon} {h.label}</td>
                        <td style={styles.logTableCell}>
                          <select value={logFormValues[h.key] ?? h.selections[0]} onChange={(e) => setLogFormValues({ ...logFormValues, [h.key]: Number(e.target.value) })} style={{ ...styles.inputBox, width: '130px', margin: 0 }}>
                            {h.selections.map((val) => (
                              <option key={val} value={val}>{h.selectionLabels?.[val] || val}</option>
                            ))}
                          </select>
                        </td>
                        <td style={styles.logTableCell}>{h.goal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="submit" style={{ ...styles.button, width: '200px', marginTop: '20px' }}>Submit</button>
              </form>
              {logSuccessMsg && <div style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>{logSuccessMsg}</div>}
            </div>
          )}

          {currentPage === 'view' && (
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ color: steelBlue, fontSize: '24px', fontWeight: 'bold' }}>My Daily Data View (4-Week)</h2>
              <div style={{ marginBottom: '20px', fontSize: '16px' }}>
                <span style={{ color: steelBlue, fontWeight: 'bold' }}>Habit: </span>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as HabitKey)} style={{ ...styles.inputBox, width: '240px', display: 'inline-block', margin: '0 15px 0 5px' }}>
                  {habitsConfig.map((h) => <option key={h.key} value={h.key}>{h.label}</option>)}
                </select>
                <span style={{ color: steelBlue, fontWeight: 'bold' }}>Goal: </span>
                <span>{habitsConfig.find((h) => h.key === selectedCategory)?.goal}</span>
              </div>
              <div style={styles.gridTable}>
                {get28DayGrid().map(({ dateStr, entry }) => {
                  const val = entry?.[selectedCategory];
                  let fontColor = charBlack;
                  if (val !== undefined) {
                    const status = getHabitColor(selectedCategory, val, currentUserGrade);
                    fontColor = status === 'green' ? 'green' : status === 'yellow' ? '#D4AC0D' : 'red';
                  }
                  return (
                    <div key={dateStr} style={styles.gridCell}>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{formatDateToMDY(dateStr)}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: fontColor }}>{val !== undefined ? val : 'Not Logged'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentPage === 'learning' && (
            <div style={{ textAlign: 'left', maxWidth: '800px', lineHeight: '1.4' }}>
              <h2 style={{ color: steelBlue, fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Learning Center</h2>
              
              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Sleep</h3>
              <p style={styles.smallContentText}>Sleep is when your brain and body recharge so you can learn, grow, and feel your best.</p>
              <h4 style={styles.smallContentHeader}>1. Your Brain Gets Stronger</h4>
              <p style={styles.smallContentText}>While you sleep, your brain organizes what you learned during the day and stores it as memories.</p>
              <h4 style={styles.smallContentHeader}>2. Your Body Grows While You Sleep</h4>
              <p style={styles.smallContentText}>Your body releases important growth hormones while you sleep, strengthening your immune system.</p>
              <h4 style={styles.smallContentHeader}>3. Better Sleep = Better Days</h4>
              <p style={styles.smallContentText}>Students who get enough sleep are more likely to feel happier and pay attention in class.</p>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Physical Activity</h3>
              <p style={styles.smallContentText}>Physical activity is any movement that gets your body working. Aim for about 60 minutes daily.</p>
              <h4 style={styles.smallContentHeader}>1. Exercise Builds a Strong Body</h4>
              <p style={styles.smallContentText}>Being active strengthens your heart, muscles, and bones while improving balance.</p>
              <h4 style={styles.smallContentHeader}>2. Moving Helps Your Brain</h4>
              <p style={styles.smallContentText}>Exercise increases blood flow to your brain, helping you concentrate and learn.</p>
              <h4 style={styles.smallContentHeader}>3. Movement Boosts Your Mood</h4>
              <p style={styles.smallContentText}>Physical activity releases chemicals that help you feel happier and less stressed.</p>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Water</h3>
              <p style={styles.smallContentText}>Water is the best drink for your body because every organ depends on it.</p>
              <h4 style={styles.smallContentHeader}>1. Water Powers Your Brain</h4>
              <p style={styles.smallContentText}>Even mild dehydration can make it harder to concentrate and stay alert.</p>
              <h4 style={styles.smallContentHeader}>2. Water Keeps Your Body Running</h4>
              <p style={styles.smallContentText}>Water helps regulate temperature and moves nutrients where needed.</p>
              <h4 style={styles.smallContentHeader}>3. Water Beats Sugary Drinks</h4>
              <p style={styles.smallContentText}>Choosing water helps protect teeth and provides hydration without added sugar.</p>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Fruits & Vegetables</h3>
              <p style={styles.smallContentText}>Fruits and vegetables are packed with vitamins, minerals, fiber, and antioxidants.</p>
              <h4 style={styles.smallContentHeader}>1. Colors Mean Different Nutrients</h4>
              <p style={styles.smallContentText}>Different colors contain unique nutrients that help your body in various ways.</p>
              <h4 style={styles.smallContentHeader}>2. Fuel for Your Body</h4>
              <p style={styles.smallContentText}>They support healthy digestion, immunity, and provide steady energy.</p>
              <h4 style={styles.smallContentHeader}>3. Healthy Habits Start Young</h4>
              <p style={styles.smallContentText}>Eating plenty helps build lifelong healthy eating habits.</p>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Whole Foods</h3>
              <p style={styles.smallContentText}>Whole foods are close to their natural form with little processing.</p>
              <h4 style={styles.smallContentHeader}>1. Better Fuel</h4>
              <p style={styles.smallContentText}>They contain more fiber, vitamins, and minerals than processed alternatives.</p>
              <h4 style={styles.smallContentHeader}>2. Longer-Lasting Energy</h4>
              <p style={styles.smallContentText}>Whole foods help you stay full longer and provide steady energy.</p>
              <h4 style={styles.smallContentHeader}>3. Small Choices Matter</h4>
              <p style={styles.smallContentText}>Choosing whole foods more often builds great habits over time.</p>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Ultra-Processed Foods</h3>
              <p style={styles.smallContentText}>Ultra-processed foods contain added sugar, salt, and unhealthy fats.</p>
              <h4 style={styles.smallContentHeader}>1. Fine Sometimes, Not All the Time</h4>
              <p style={styles.smallContentText}>They can be enjoyed occasionally in moderation.</p>
              <h4 style={styles.smallContentHeader}>2. Less Nutrition</h4>
              <p style={styles.smallContentText}>They typically contain fewer vitamins and fiber.</p>
              <h4 style={styles.smallContentHeader}>3. Think About Balance</h4>
              <p style={styles.smallContentText}>Focusing on whole foods most of the time keeps your body healthy.</p>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Sugary Drinks</h3>
              <p style={styles.smallContentText}>Sugary drinks include soda, sweet teas, and energy drinks with lots of added sugar.</p>
              <h4 style={styles.smallContentHeader}>1. Sugar Adds Up Fast</h4>
              <p style={styles.smallContentText}>One drink can contain many teaspoons of added sugar.</p>
              <h4 style={styles.smallContentHeader}>2. Water Is the Best Choice</h4>
              <p style={styles.smallContentText}>Water remains the optimal way to stay hydrated.</p>
              <h4 style={styles.smallContentHeader}>3. Protect Your Smile</h4>
              <p style={styles.smallContentText}>Drinking fewer sugary beverages reduces cavity risks.</p>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ color: steelBlue, fontSize: '18px', fontWeight: 'bold', marginTop: '10px', marginBottom: '4px' }}>Mood</h3>
              <p style={styles.smallContentText}>Your mood reflects how you feel emotionally throughout the day.</p>
              <h4 style={styles.smallContentHeader}>1. Healthy Habits Work Together</h4>
              <p style={styles.smallContentText}>Sleep, hydration, and nutrition collaborate to support positive well-being.</p>
              <h4 style={styles.smallContentHeader}>2. Your Body and Brain Are Connected</h4>
              <p style={styles.smallContentText}>Rest and movement make learning and focus easier.</p>
              <h4 style={styles.smallContentHeader}>3. Small Habits Can Make a Big Difference</h4>
              <p style={styles.smallContentText}>Consistent healthy habits help you feel energized and ready for each day.</p>
            </div>
          )}

          {currentPage === 'resources' && (
            <div style={{ textAlign: 'left', maxWidth: '800px', lineHeight: '1.4' }}>
              <h2 style={{ color: steelBlue, fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Community Resources in Indianapolis, IN</h2>
              
              <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: '8px 0 3px 0' }}>Free Groceries and Meals</h3>
              <p style={styles.smallContentText}>Find services to search for free groceries and meals if you need extra support.</p>
              <a href="https://www.communitycompass.app/home" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Community Compass</a>
              <a href="https://www.foodpantries.org/ci/in-indianapolis" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Indianapolis Food Pantries</a>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: '8px 0 3px 0' }}>Free Student Meal Services</h3>
              <p style={styles.smallContentText}>Find free student meal programs offering breakfast, lunch, and snack options.</p>
              <a href="https://www.myips.org/student-family-references/foodservice" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Indianapolis Public Schools</a>
              <a href="https://parks.indy.gov/programs/free-meals-programs/?utm_source=chatgpt.com" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Indy Parks & Recreation</a>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: '8px 0 3px 0' }}>Youth Activities - Parks, Playgrounds, Walking Trails & Sports</h3>
              <p style={styles.smallContentText}>Find parks, playgrounds, trails, and youth sports programs for active fun.</p>
              <a href="https://parks.indy.gov/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Indy Parks & Recreation</a>
              <a href="https://www.indy.gov/activity/find-a-trail" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>indy.gov trails</a>
              <a href="https://anc.apm.activecommunities.com/indyparks/activity/search?onlineSiteId=0&activity_select_param=2&activity_department_ids=4&viewMode=list" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Youth sports</a>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: '8px 0 3px 0' }}>Community Recreation Centers</h3>
              <p style={styles.smallContentText}>Find a Community Center near you to stay active and connected.</p>
              <a href="https://parks.indy.gov/programs/free-meals-programs/?utm_source=chatgpt.com" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Map of Indianapolis Community Centers</a>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: '8px 0 3px 0' }}>Homework Help</h3>
              <p style={styles.smallContentText}>Find programs offering support with schoolwork and assignments.</p>
              <a href="https://www.indypl.org/services/homework-help" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Indianapolis Public Library</a>

              <div style={styles.halfHeightSpace} />

              <h3 style={{ fontWeight: 'bold', fontSize: '15px', margin: '8px 0 3px 0' }}>Mentoring</h3>
              <p style={styles.smallContentText}>Find trusted adults who encourage and support your growth.</p>
              <a href="https://www.bebigforkids.org/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Big Brothers Big Sisters of Central Indiana</a>
              <a href="https://www.bgcindy.org/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Boys and Girls Club of Indianapolis</a>
              <a href="https://dreamaliveinc.org/" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Dream Alive</a>
              <a href="https://www.elevateindy.org/holistic-mentoring" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Elevate Indianapolis</a>
              <a href="https://www.starfishinitiative.org/?utm_source=chatgpt.com" target="_blank" rel="noreferrer" style={styles.resourceIndentLink}>Starfish Initiative</a>
            </div>
          )}

          {currentPage === 'survey' && (
            <div style={{ textAlign: 'left', maxWidth: '750px', lineHeight: '1.4' }}>
              <h2 style={{ color: steelBlue, fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Survey</h2>
              <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px 0' }}>Help Us Help You!</p>
              <p style={styles.smallContentText}>Your answers help us understand student healthy habits. Responses are voluntary and anonymous.</p>

              <div style={styles.halfHeightSpace} />

              <form onSubmit={handleSurveySubmit}>
                {currentUserRole === 'Teacher' ? (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0' }}>What is the biggest health challenge affecting your students?</p>
                    <select value={surveyTeacherChallenge} onChange={(e) => setSurveyTeacherChallenge(e.target.value)} style={{ ...styles.inputBox, maxWidth: '350px' }}>
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
                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0' }}>Which healthy habit is the hardest for you? (Select all that apply)</p>
                      {["Getting enough sleep", "Drinking enough water", "Eating fruits and vegetables", "Being physically active", "Limiting sugary drinks or ultra-processed foods", "Nothing in particular right now"].map((opt) => (
                        <label key={opt} style={{ display: 'block', margin: '3px 0', cursor: 'pointer', fontSize: '13px' }}>
                          <input type="checkbox" value={opt} checked={surveyStudentHardestHabit.includes(opt)} onChange={(e) => {
                            if (e.target.checked) setSurveyStudentHardestHabit([...surveyStudentHardestHabit, opt]);
                            else setSurveyStudentHardestHabit(surveyStudentHardestHabit.filter((i) => i !== opt));
                          }} style={{ marginRight: '8px' }} />
                          {opt}
                        </label>
                      ))}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0' }}>What makes healthy habits difficult? (Select all that apply)</p>
                      {["I don't have enough time", "Healthy foods or activities cost too much", "I don't have transportation", "I have too much homework or other responsibilities", "I don't have a safe place to be active", "I don't know where to find healthy resources", "Something else", "Nothing in particular right now"].map((opt) => (
                        <label key={opt} style={{ display: 'block', margin: '3px 0', cursor: 'pointer', fontSize: '13px' }}>
                          <input type="checkbox" value={opt} checked={surveyStudentDifficultyReason.includes(opt)} onChange={(e) => {
                            if (e.target.checked) setSurveyStudentDifficultyReason([...surveyStudentDifficultyReason, opt]);
                            else setSurveyStudentDifficultyReason(surveyStudentDifficultyReason.filter((i) => i !== opt));
                          }} style={{ marginRight: '8px' }} />
                          {opt}
                        </label>
                      ))}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0' }}>Which community resources would you like to learn more about? (Select all that apply)</p>
                      {["Free student meals", "Food pantries", "Recreation centers", "Parks, playgrounds, and trails", "Youth sports", "Homework help or tutoring", "Mentoring programs", "None right now"].map((opt) => (
                        <label key={opt} style={{ display: 'block', margin: '3px 0', cursor: 'pointer', fontSize: '13px' }}>
                          <input type="checkbox" value={opt} checked={surveyStudentResourceInterest.includes(opt)} onChange={(e) => {
                            if (e.target.checked) setSurveyStudentResourceInterest([...surveyStudentResourceInterest, opt]);
                            else setSurveyStudentResourceInterest(surveyStudentResourceInterest.filter((i) => i !== opt));
                          }} style={{ marginRight: '8px' }} />
                          {opt}
                        </label>
                      ))}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0' }}>How has practicing healthy habits affected you this month?</p>
                      {["I have more energy", "I can focus better in class", "I’m sleeping better or more", "My mood has improved", "I feel stronger or more active", "I haven’t noticed a difference, yet"].map((opt) => (
                        <label key={opt} style={{ display: 'block', margin: '3px 0', cursor: 'pointer', fontSize: '13px' }}>
                          <input type="radio" name="surveyImpact" value={opt} checked={surveyStudentImpact === opt} onChange={(e) => setSurveyStudentImpact(e.target.value)} style={{ marginRight: '8px' }} />
                          {opt}
                        </label>
                      ))}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0' }}>Would you like more healthy habit tips and local resources?</p>
                      <select value={surveyStudentMoreTips} onChange={(e) => setSurveyStudentMoreTips(e.target.value)} style={{ ...styles.inputBox, maxWidth: '250px' }}>
                        <option value="">Select an option...</option>
                        <option value="Yes">Yes</option>
                        <option value="Maybe later">Maybe later</option>
                        <option value="No thanks">No thanks</option>
                      </select>
                    </div>
                  </div>
                )}

                <div style={styles.halfHeightSpace} />
                <button type="submit" style={{ ...styles.button, width: '180px', marginTop: '10px' }}>Submit</button>
              </form>
              {surveySuccessMsg && <div style={{ color: 'green', marginTop: '10px', fontWeight: 'bold', fontSize: '14px' }}>{surveySuccessMsg}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}