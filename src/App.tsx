import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo.png';

// LOGO URL defined from imported asset
const LOGO_URL = logoImg;

// --- Types & Interfaces ---
interface DailyEntry {
  date: string; // YYYY-MM-DD
  water: number; // 0 to 13
  sleep: number; // 0 to 10
}

interface UserData {
  username: string;
  role: 'Teacher' | 'Student';
  grade?: 'K - 5th' | '6th - 8th' | '9th - 12th' | '';
  classroomCode: string;
  entries: Record<string, DailyEntry>; // Keyed by YYYY-MM-DD
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

  // Log Data Inputs
  const [logWater, setLogWater] = useState<number>(0);
  const [logSleep, setLogSleep] = useState<number>(0);
  const [logSuccessMsg, setLogSuccessMsg] = useState('');

  // View Data State
  const [selectedCategory, setSelectedCategory] = useState<'water' | 'sleep'>('water');

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

  // Helper: Format ISO date string (YYYY-MM-DD) to MM/DD/YYYY
  const formatDateToMDY = (isoStr: string) => {
    if (!isoStr) return '';
    const [yyyy, mm, dd] = isoStr.split('-');
    return `${mm}/${dd}/${yyyy}`;
  };

  // Helper: Get Grade for Current User
  const getCurrentUserGrade = (): string => {
    if (!currentUser || !usersDb[currentUser]) return '';
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

    const newEntries = { ...(user.entries || {}), [todayISO]: { date: todayISO, water: logWater, sleep: logSleep } };

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

  const getWeeklyAverage = (type: 'water' | 'sleep') => {
    const entries = getUserEntries();
    if (entries.length === 0) return 0;
    const last7 = entries.slice(-7);
    const sum = last7.reduce((acc, curr) => acc + curr[type], 0);
    return Math.round((sum / last7.length) * 10) / 10;
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

  // Scorecard Status Indicators
  const renderWaterIcon = (avg: number) => {
    if (avg >= 9) return <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>;
    if (avg === 8) return <span style={{ color: '#D4AC0D', fontWeight: 'bold' }}>●</span>;
    return <span style={{ color: 'red', fontWeight: 'bold' }}>✕</span>;
  };

  const renderSleepIcon = (avg: number) => {
    if (avg >= 8) return <span style={{ color: 'green', fontWeight: 'bold' }}>✓</span>;
    if (avg === 7) return <span style={{ color: '#D4AC0D', fontWeight: 'bold' }}>●</span>;
    return <span style={{ color: 'red', fontWeight: 'bold' }}>✕</span>;
  };

  // --- Theme Colors & Fonts ---
  const steelBlue = '#3E6F9B';
  const cream = '#FCFAF5';
  const charBlack = '#202124';

  const blueFont = "'Manrope', sans-serif";
  const blackFont = "'Inter', sans-serif";

  const styles: Record<string, React.CSSProperties> = {
    appContainer: {
      fontFamily: blackFont,
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
    titleText: {
      fontFamily: blueFont,
      color: steelBlue,
      fontSize: '28px',
      fontWeight: 600,
      margin: '10px 0'
    },
    taglineText: {
      fontFamily: blueFont,
      color: steelBlue,
      fontSize: '18px',
      fontWeight: 600,
      marginTop: '5px'
    },
    mainLogoImage: {
      maxWidth: '220px',
      maxHeight: '140px',
      objectFit: 'contain',
      margin: '15px auto',
      display: 'block'
    },
    navLogoImage: {
      maxWidth: '120px',
      maxHeight: '80px',
      objectFit: 'contain',
      margin: '0 auto 20px auto',
      display: 'block'
    },
    headerLogoImage: {
      maxWidth: '180px',
      maxHeight: '90px',
      objectFit: 'contain',
      margin: '0 auto 5px auto',
      display: 'block'
    },
    authContainer: {
      width: '420px',
      margin: '0 auto',
      textAlign: 'left'
    },
    sectionHeading: {
      fontFamily: blackFont,
      fontSize: '18px',
      fontWeight: 'bold',
      color: charBlack,
      marginTop: '15px',
      marginBottom: '6px'
    },
    inputBox: {
      width: '100%',
      padding: '10px',
      margin: '6px 0',
      fontFamily: blackFont,
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      backgroundColor: steelBlue,
      color: '#FFFFFF',
      border: 'none',
      padding: '10px',
      fontFamily: blueFont,
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: '15px'
    },
    linkText: {
      marginTop: '15px',
      color: charBlack,
      fontFamily: blackFont,
      fontSize: '14px'
    },
    linkAnchor: {
      color: steelBlue,
      cursor: 'pointer',
      textDecoration: 'underline',
      fontFamily: blackFont
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
      fontFamily: blackFont,
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
      fontFamily: blackFont
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
      fontFamily: blackFont,
      color: charBlack,
      fontSize: '15px'
    },
    logTableHeaderCell: {
      padding: '10px 12px',
      textAlign: 'left',
      fontFamily: blueFont,
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
            <div style={styles.titleText}>Welcome to HealthyHabitsED</div>
            <img src={LOGO_URL} alt="HealthyHabitsED Logo" style={styles.mainLogoImage} />
            <div style={styles.taglineText}>Healthy Habits, Strong Minds, Bright Futures</div>
          </div>

          <div style={styles.authContainer}>
            <h2 style={{ color: charBlack, marginBottom: '5px', fontFamily: blackFont }}>Login</h2>

            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                style={styles.inputBox}
              />

              {loginError && (
                <div style={{ color: 'red', fontSize: '13px', marginTop: '4px', fontFamily: blackFont }}>
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
            <div style={styles.titleText}>Register for HealthyHabitsED</div>
            <img src={LOGO_URL} alt="HealthyHabitsED Logo" style={styles.mainLogoImage} />
            <div style={styles.taglineText}>Healthy Habits, Strong Minds, Bright Futures</div>
          </div>

          <div style={styles.authContainer}>
            <form onSubmit={handleRegister}>
              <div style={styles.sectionHeading}>Are you a teacher or student?</div>
              <div style={{ fontFamily: blackFont }}>
                <label style={{ marginRight: '15px', color: charBlack, cursor: 'pointer' }}>
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
                <label style={{ color: charBlack, cursor: 'pointer' }}>
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
                <div style={{ color: roleError ? 'red' : charBlack, fontSize: '12px', marginTop: '4px' }}>
                  Please select whether you are a teacher registering a new classroom or a student registering into an existing classroom with a classroom code that your teacher has given you. This is a required field.
                </div>
              </div>

              <div style={styles.sectionHeading}>What grade is your classroom?</div>
              <div style={{ fontFamily: blackFont }}>
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
                <div style={{ color: gradeError ? 'red' : charBlack, fontSize: '12px', marginTop: '4px' }}>
                  If you are a teacher, this is a required field. Please select the grade of your classroom. If you are a student, you do not need to make a selection. Your teacher will have already done this for your classroom.
                </div>
              </div>

              <div style={styles.sectionHeading}>What is your username?</div>
              <div style={{ fontFamily: blackFont }}>
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
                <div style={{ color: regFormatError ? 'red' : charBlack, fontSize: '12px', marginTop: '4px' }}>
                  Please select a username that is 6-12 alphanumeric characters (no special characters).
                </div>
                {regTakenError && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                    That username has already been registered. Please select a different username.
                  </div>
                )}
              </div>

              <div style={styles.sectionHeading}>What is your classroom id?</div>
              <div style={{ fontFamily: blackFont }}>
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
                <div style={{ color: codeEmptyError ? 'red' : charBlack, fontSize: '12px', marginTop: '4px' }}>
                  If you are a teacher registering a new classroom, please enter a unique code for your classroom. If you are a student joining your teacher’s classroom, please enter the classroom code that your teacher gave you.
                </div>
                {codeCustomError && (
                  <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
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
  const waterAvg = getWeeklyAverage('water');
  const sleepAvg = getWeeklyAverage('sleep');
  const currentUserGrade = getCurrentUserGrade();

  return (
    <div style={styles.appContainer}>
      <div style={styles.dashboardLayout}>
        <div style={styles.sidebar}>
          <img src={LOGO_URL} alt="HealthyHabitsED Logo" style={styles.navLogoImage} />

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
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <img src={LOGO_URL} alt="HealthyHabitsED Logo" style={styles.headerLogoImage} />

            <br />
            <div style={{ color: charBlack, fontFamily: blackFont, fontSize: '16px' }}>
              My Grade: {currentUserGrade}
            </div>
            <br />

            <div style={{ color: charBlack, fontFamily: blackFont, fontSize: '16px' }}>
              Today's Date: {getTodayESTFormatted()}
            </div>
          </div>

          {/* Home / Weekly Scorecard */}
          {currentPage === 'home' && (
            <div style={{ textAlign: 'left', maxWidth: '600px' }}>
              <h2 style={{ color: steelBlue, fontFamily: blueFont }}>
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
                  <tr>
                    <td style={styles.logTableCell}>💧 Water</td>
                    <td style={styles.logTableCell}>9 - 13 cups / day</td>
                    <td style={styles.logTableCell}>
                      {waterAvg} <span style={{ marginLeft: '10px' }}>{renderWaterIcon(waterAvg)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.logTableCell}>💤 Sleep</td>
                    <td style={styles.logTableCell}>8 - 10 hours / day</td>
                    <td style={styles.logTableCell}>
                      {sleepAvg} <span style={{ marginLeft: '10px' }}>{renderSleepIcon(sleepAvg)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Log My Daily Data Page */}
          {currentPage === 'log' && (
            <div style={{ textAlign: 'left', maxWidth: '600px' }}>
              <h2 style={{ color: steelBlue, fontFamily: blueFont }}>Log My Daily Data</h2>

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
                    <tr>
                      <td style={styles.logTableCell}>💧 Water</td>
                      <td style={styles.logTableCell}>
                        <select
                          value={logWater}
                          onChange={(e) => setLogWater(Number(e.target.value))}
                          style={{ padding: '5px 10px', fontFamily: blackFont }}
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                          <option value={13}>13+</option>
                        </select>
                      </td>
                      <td style={styles.logTableCell}>9-13 cups / day</td>
                    </tr>
                    <tr>
                      <td style={styles.logTableCell}>💤 Sleep</td>
                      <td style={styles.logTableCell}>
                        <select
                          value={logSleep}
                          onChange={(e) => setLogSleep(Number(e.target.value))}
                          style={{ padding: '5px 10px', fontFamily: blackFont }}
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                          <option value={10}>10+</option>
                        </select>
                      </td>
                      <td style={styles.logTableCell}>8-10 hours / day</td>
                    </tr>
                  </tbody>
                </table>

                <button type="submit" style={{ ...styles.button, width: '150px', marginTop: '20px' }}>
                  Submit
                </button>

                {logSuccessMsg && (
                  <div style={{ color: 'green', marginTop: '10px', fontWeight: 'bold', fontFamily: blackFont }}>
                    {logSuccessMsg}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* View My Daily Data Page */}
          {currentPage === 'view' && (
            <div style={{ textAlign: 'left', fontFamily: blackFont }}>
              <h2 style={{ color: steelBlue, fontFamily: blueFont, marginBottom: '5px' }}>
                View My Daily Data (4-Week)
              </h2>
              <br />

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <span style={{ fontWeight: 'bold' }}>Habit:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'water' | 'sleep')}
                  style={{ padding: '6px 12px', fontFamily: blackFont }}
                >
                  <option value="water">Water</option>
                  <option value="sleep">Sleep</option>
                </select>

                <span style={{ color: steelBlue, fontWeight: 'bold', fontFamily: blueFont }}>
                  {selectedCategory === 'water' ? 'Goal: 9-13 cups / day' : 'Goal: 8-10 hours / day'}
                </span>
              </div>

              <div style={styles.gridTable}>
                {get28DayGrid().map(({ dateStr, entry }) => {
                  let textVal = 'Not Logged';
                  let textColor = charBlack;

                  if (entry) {
                    const val = entry[selectedCategory];
                    if (selectedCategory === 'water') {
                      textVal = val === 13 ? '13+' : `${val}`;
                      if (val >= 9) textColor = 'green';
                      else if (val === 8) textColor = '#D4AC0D';
                      else textColor = 'red';
                    } else {
                      textVal = val === 10 ? '10+' : `${val}`;
                      if (val >= 8) textColor = 'green';
                      else if (val === 7) textColor = '#D4AC0D';
                      else textColor = 'red';
                    }
                  }

                  return (
                    <div key={dateStr} style={styles.gridCell}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {formatDateToMDY(dateStr)}
                      </div>
                      <div style={{ color: textColor, fontWeight: entry ? 'bold' : 'normal' }}>
                        {textVal}
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