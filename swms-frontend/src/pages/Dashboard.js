import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import './Dashboard.css';

const ROLE_ENDPOINTS = { ADMIN: '/api/analytics/admin', MANAGER: '/api/analytics/manager', EMPLOYEE: '/api/analytics/employee' };
const ROLE_PREFIX = { ADMIN: '/admin', MANAGER: '/manager', EMPLOYEE: '/employee' };
const COLORS = ['#818cf8', '#ec4899', '#22d3ee', '#f59e0b', '#34d399', '#fb7185'];
const TONES = { TODO: '#818cf8', IN_PROGRESS: '#22d3ee', COMPLETED: '#34d399', CANCELLED: '#fb7185', PRESENT: '#34d399', LATE: '#f59e0b', HALF_DAY: '#22d3ee', ABSENT: '#fb7185' };
const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.96)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 12, color: '#e2e8f0' };
const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const defaults = {
  ADMIN: {
    kpis: [{ label: 'Active Users', value: '14', helper: 'Across every role' }, { label: 'Open Tasks', value: '48', helper: 'Running workflows' }, { label: 'Attendance Records', value: '1008', helper: 'Last 120 days' }, { label: 'Departments Online', value: '6', helper: 'Live teams tracked' }],
    usersByRole: [{ label: 'Employee', value: 8 }, { label: 'Manager', value: 4 }, { label: 'Admin', value: 2 }],
    monthlyActivity: [{ label: 'Oct', value: 6 }, { label: 'Nov', value: 8 }, { label: 'Dec', value: 7 }, { label: 'Jan', value: 9 }, { label: 'Feb', value: 10 }, { label: 'Mar', value: 8 }],
    deptHeadcount: [{ label: 'Engineering', value: 3 }, { label: 'Sales', value: 3 }, { label: 'HR', value: 3 }, { label: 'Finance', value: 3 }],
    taskStatus: [{ label: 'Todo', value: 12 }, { label: 'In progress', value: 20 }, { label: 'Completed', value: 11 }, { label: 'Cancelled', value: 5 }],
    deptCompletion: [{ label: 'Engineering', value: 82 }, { label: 'Sales', value: 76 }, { label: 'HR', value: 88 }, { label: 'Finance', value: 79 }],
  },
  MANAGER: {
    kpis: [{ label: 'Sprint Velocity', value: '9', helper: 'Completed in the last 14 days' }, { label: 'Team Capacity', value: '78%', helper: 'Completion rate' }, { label: 'Risks Mitigated', value: '4', helper: 'Closed or cancelled items' }],
    sprintVelocity: [{ label: 'W1', value: 3 }, { label: 'W2', value: 5 }, { label: 'W3', value: 6 }, { label: 'W4', value: 4 }, { label: 'W5', value: 7 }, { label: 'W6', value: 9 }],
    teamWorkload: [{ label: 'Eve', assigned: 6, completed: 4 }, { label: 'Iris', assigned: 5, completed: 4 }, { label: 'Frank', assigned: 4, completed: 3 }],
    riskFunnel: [{ label: 'W1', open: 5, mitigated: 2 }, { label: 'W2', open: 4, mitigated: 3 }, { label: 'W3', open: 4, mitigated: 4 }, { label: 'W4', open: 3, mitigated: 3 }, { label: 'W5', open: 3, mitigated: 4 }, { label: 'W6', open: 2, mitigated: 4 }],
    teamHealth: [{ label: 'Planning', value: 78 }, { label: 'Delivery', value: 84 }, { label: 'Quality', value: 76 }, { label: 'Collaboration', value: 88 }, { label: 'Upskilling', value: 71 }],
  },
  EMPLOYEE: {
    kpis: [{ label: 'Tasks Completed', value: '7', helper: 'Past 30 days' }, { label: 'Attendance', value: '95%', helper: '30-day rate' }, { label: 'Learning Hours', value: '16h', helper: 'Upskilling time' }],
    productivity: [{ label: 'W1', value: 2 }, { label: 'W2', value: 3 }, { label: 'W3', value: 4 }, { label: 'W4', value: 5 }, { label: 'W5', value: 4 }, { label: 'W6', value: 6 }],
    attendancePulse: [{ label: 'Oct', value: 92 }, { label: 'Nov', value: 94 }, { label: 'Dec', value: 93 }, { label: 'Jan', value: 96 }, { label: 'Feb', value: 95 }, { label: 'Mar', value: 97 }],
    skillFocus: [{ label: 'Product', value: 76 }, { label: 'Compliance', value: 82 }, { label: 'Automation', value: 68 }, { label: 'Clients', value: 74 }],
    taskMix: [{ label: 'Todo', value: 2 }, { label: 'In progress', value: 3 }, { label: 'Completed', value: 7 }, { label: 'Cancelled', value: 1 }],
  },
};

const titleize = (value = '') => value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
const sum = (items = []) => items.reduce((total, item) => total + Number(item.value || 0), 0);
const mergeData = (role, incoming) => ({ ...defaults[role], ...(incoming || {}), kpis: incoming?.kpis?.length ? incoming.kpis : defaults[role].kpis });
const upcomingTasks = (tasks = [], limit = 4) => [...tasks].filter((task) => task.deadline && task.status !== 'COMPLETED' && task.status !== 'CANCELLED').sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, limit);
const recentTasks = (tasks = [], limit = 5) => [...tasks].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, limit);
const managerTasks = (tasks = [], userId) => tasks.filter((task) => task.createdById === userId);
const taskCounts = (tasks = []) => ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => ({ label: titleize(status), value: tasks.filter((task) => task.status === status).length })).filter((item) => item.value > 0);
const attendanceCounts = (records = []) => ['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT'].map((status) => ({ label: titleize(status), value: records.filter((record) => record.status === status).length }));

function weeklyAttendance(records = []) {
  const today = new Date();
  const output = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const iso = date.toISOString().slice(0, 10);
    const day = records.filter((record) => record.date === iso);
    output.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present: day.filter((record) => record.status === 'PRESENT').length,
      late: day.filter((record) => record.status === 'LATE').length,
      halfDay: day.filter((record) => record.status === 'HALF_DAY').length,
      absent: day.filter((record) => record.status === 'ABSENT').length,
    });
  }
  return output;
}

function Card({ eyebrow, title, children }) {
  return (
    <section className="glass-card">
      <div className="glass-card-header">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Hero({ title, subtitle, actions, cards }) {
  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <span className="dashboard-date-chip">{longDate.format(new Date())}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="dashboard-actions">
          {actions.map((action) => (
            <Link key={action.label} to={action.to} className={`dashboard-action-button ${action.secondary ? 'secondary' : ''}`}>{action.label}</Link>
          ))}
        </div>
      </div>
      <div className="dashboard-hero-metrics">
        {cards.map((card, index) => (
          <div key={card.label} className="metric-card" style={{ '--metricGlow': COLORS[index % COLORS.length] }}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.helper}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListBlock({ items, empty, mapper }) {
  if (!items.length) return <p className="empty-state">{empty}</p>;
  return <div className="stack-list">{items.map(mapper)}</div>;
}

function SummaryRows({ items }) {
  return (
    <div className="summary-stack">
      {items.map((item, index) => (
        <div key={item.label} className="summary-split">
          <div className="summary-dot" style={{ background: COLORS[index % COLORS.length] }} />
          <div>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <small>{item.helper}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderAdmin(user, prefix, analytics, tasks, attendance) {
  const departmentRows = analytics.deptHeadcount.map((item) => ({
    label: item.label,
    value: `${item.value} members`,
    helper: `${analytics.deptCompletion.find((entry) => entry.label === item.label)?.value || 0}% completion`,
  }));
  const weekly = weeklyAttendance(attendance);
  const statuses = analytics.taskStatus?.length ? analytics.taskStatus : taskCounts(tasks);

  return (
    <>
      <Hero title={`Command center for ${user?.name}`} subtitle="A platform view of workforce volume, attendance consistency, and department delivery in the same screen." actions={[{ label: 'Manage Users', to: `${prefix}/users` }, { label: 'Review Tasks', to: `${prefix}/tasks`, secondary: true }]} cards={analytics.kpis} />
      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <Card eyebrow="Enterprise Trend" title="Workflow volume over the last 6 months">
            <div className="chart-shell chart-tall">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyActivity}>
                  <defs><linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.45} /><stop offset="95%" stopColor="#818cf8" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#818cf8" fill="url(#adminFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <div className="dashboard-double-grid">
            <Card eyebrow="Attendance Mix" title="Last 7 days by status">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="present" stackId="a" fill="#34d399" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="late" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="halfDay" stackId="a" fill="#22d3ee" />
                    <Bar dataKey="absent" stackId="a" fill="#fb7185" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card eyebrow="Workforce Split" title="Users by role">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.usersByRole} dataKey="value" nameKey="label" innerRadius={62} outerRadius={100} paddingAngle={4}>
                      {analytics.usersByRole.map((entry, index) => <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <Card eyebrow="Execution Quality" title="Department completion rate">
            <div className="chart-shell chart-medium">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.deptCompletion} layout="vertical">
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis type="category" dataKey="label" width={90} tickLine={false} axisLine={false} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#ec4899" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <div className="dashboard-side-column">
          <Card eyebrow="Department Snapshot" title="Headcount and completion"><SummaryRows items={departmentRows} /></Card>
          <Card eyebrow="Task Distribution" title="Status balance"><SummaryRows items={statuses.map((item) => ({ label: item.label, value: Math.round(item.value), helper: `${sum(statuses) ? Math.round((item.value / sum(statuses)) * 100) : 0}% of active volume` }))} /></Card>
          <Card eyebrow="Recent Activity" title="Latest task movement">
            <ListBlock items={recentTasks(tasks)} empty="No task movement yet." mapper={(task) => (
              <div key={task.id} className="list-card">
                <div><strong>{task.title}</strong><span>{task.assignedToName || 'Unassigned'}</span></div>
                <div className="list-card-meta"><small>{titleize(task.status)}</small><span className="status-pill" style={{ background: `${TONES[task.status] || '#818cf8'}22`, color: TONES[task.status] || '#818cf8' }}>{task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}</span></div>
              </div>
            )} />
          </Card>
        </div>
      </div>
    </>
  );
}

function renderManager(user, prefix, analytics, tasks, attendance) {
  const mine = managerTasks(tasks, user?.userId);
  const statuses = taskCounts(mine);
  const attendanceMix = attendanceCounts(attendance);
  return (
    <>
      <Hero title={`Delivery pulse for ${user?.name}`} subtitle="Track sprint velocity, risk burn-down, and ownership balance without leaving the dashboard." actions={[{ label: 'Manage Tasks', to: `${prefix}/tasks` }, { label: 'Attendance View', to: `${prefix}/attendance`, secondary: true }]} cards={analytics.kpis} />
      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <div className="dashboard-double-grid">
            <Card eyebrow="Delivery Trend" title="Sprint velocity">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.sprintVelocity}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card eyebrow="Capacity Map" title="Assigned vs completed">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.teamWorkload}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="assigned" fill="#818cf8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="#34d399" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <div className="dashboard-double-grid">
            <Card eyebrow="Risk View" title="Open vs mitigated items">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.riskFunnel}>
                    <defs><linearGradient id="riskOpen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient><linearGradient id="riskClosed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.35} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="open" stroke="#f59e0b" fill="url(#riskOpen)" strokeWidth={3} />
                    <Area type="monotone" dataKey="mitigated" stroke="#34d399" fill="url(#riskClosed)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card eyebrow="Team Quality" title="Health radar">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.teamHealth} outerRadius={92}>
                    <PolarGrid stroke="rgba(148,163,184,0.18)" />
                    <PolarAngleAxis dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                    <Radar dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.34} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
        <div className="dashboard-side-column">
          <Card eyebrow="Priority Queue" title="Upcoming deadlines">
            <ListBlock items={upcomingTasks(mine, 5)} empty="No upcoming deadlines." mapper={(task) => (
              <div key={task.id} className="list-card">
                <div><strong>{task.title}</strong><span>{task.assignedToName || 'Unassigned'}</span></div>
                <div className="list-card-meta"><small>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small><span className="status-pill" style={{ background: `${TONES[task.status] || '#818cf8'}22`, color: TONES[task.status] || '#818cf8' }}>{titleize(task.status)}</span></div>
              </div>
            )} />
          </Card>
          <Card eyebrow="Board Balance" title="My task status mix"><SummaryRows items={statuses.map((item) => ({ label: item.label, value: item.value, helper: `${sum(statuses) ? Math.round((item.value / sum(statuses)) * 100) : 0}% of my workload` }))} /></Card>
          <Card eyebrow="Attendance Context" title="Team attendance distribution"><SummaryRows items={attendanceMix.map((item) => ({ label: item.label, value: item.value, helper: `${sum(attendanceMix) ? Math.round((item.value / sum(attendanceMix)) * 100) : 0}% of records` }))} /></Card>
        </div>
      </div>
    </>
  );
}

function renderEmployee(user, prefix, analytics, tasks) {
  const focusAverage = Math.round(sum(analytics.skillFocus) / Math.max(1, analytics.skillFocus.length));
  return (
    <>
      <Hero title={`Personal performance for ${user?.name}`} subtitle="Your dashboard combines output, attendance quality, and skill investment in one focused workspace." actions={[{ label: 'My Tasks', to: `${prefix}/tasks` }, { label: 'My Attendance', to: `${prefix}/attendance`, secondary: true }]} cards={analytics.kpis} />
      <div className="dashboard-grid">
        <div className="dashboard-main-column">
          <div className="dashboard-double-grid">
            <Card eyebrow="Output Trend" title="Weekly productivity">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.productivity}>
                    <defs><linearGradient id="employeeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#34d399" stopOpacity={0.45} /><stop offset="95%" stopColor="#34d399" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke="#34d399" fill="url(#employeeFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card eyebrow="Consistency" title="Monthly attendance pulse">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.attendancePulse}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis domain={[70, 100]} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
                    <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#22d3ee' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          <div className="dashboard-double-grid">
            <Card eyebrow="Focus Mix" title="Skill investment">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="28%" outerRadius="80%" data={analytics.skillFocus} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="category" dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                    <RadialBar background dataKey="value" fill="#a855f7" cornerRadius={10} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card eyebrow="Task Balance" title="Current work mix">
              <div className="chart-shell">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.taskMix} dataKey="value" nameKey="label" innerRadius={58} outerRadius={100} paddingAngle={4}>
                      {analytics.taskMix.map((entry, index) => <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
        <div className="dashboard-side-column">
          <Card eyebrow="Next Actions" title="Upcoming deadlines">
            <ListBlock items={upcomingTasks(tasks)} empty="No upcoming tasks." mapper={(task) => (
              <div key={task.id} className="list-card">
                <div><strong>{task.title}</strong><span>{task.createdByName || 'Assigned workflow'}</span></div>
                <div className="list-card-meta"><small>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small><span className="status-pill" style={{ background: `${TONES[task.status] || '#818cf8'}22`, color: TONES[task.status] || '#818cf8' }}>{titleize(task.status)}</span></div>
              </div>
            )} />
          </Card>
          <Card eyebrow="Personal Snapshot" title="What stands out">
            <SummaryRows items={[{ label: 'Tasks completed', value: tasks.filter((task) => task.status === 'COMPLETED').length, helper: 'Closed items in your queue' }, { label: 'Skill focus average', value: `${focusAverage}%`, helper: 'Across your growth areas' }, { label: 'Attendance momentum', value: analytics.kpis[1]?.value || '0%', helper: 'Steady presence over recent months' }]} />
          </Card>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';
  const rolePrefix = ROLE_PREFIX[role];
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [analytics, setAnalytics] = useState(defaults[role]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const [taskResult, attendanceResult, analyticsResult] = await Promise.allSettled([api.get('/api/tasks'), api.get('/api/attendance'), api.get(ROLE_ENDPOINTS[role])]);
      if (!mounted) return;
      setTasks(taskResult.status === 'fulfilled' ? taskResult.value.data : []);
      setAttendance(attendanceResult.status === 'fulfilled' ? attendanceResult.value.data : []);
      setAnalytics(analyticsResult.status === 'fulfilled' ? mergeData(role, analyticsResult.value.data) : defaults[role]);
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [role]);

  return (
    <>
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <main className="dashboard-page">
          <div className="dashboard-backdrop" />
          {loading ? (
            <div className="dashboard-loading">
              <div className="loading-card">
                <span>Preparing your analytics workspace</span>
                <strong>Loading charts, attendance, and task data...</strong>
              </div>
            </div>
          ) : role === 'ADMIN' ? renderAdmin(user, rolePrefix, analytics, tasks, attendance) : role === 'MANAGER' ? renderManager(user, rolePrefix, analytics, tasks, attendance) : renderEmployee(user, rolePrefix, analytics, tasks)}
        </main>
      </div>
    </>
  );
}
