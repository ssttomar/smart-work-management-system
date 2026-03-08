import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, AreaChart, Area } from "recharts";

const COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444"];
const usersByRole    = [{name:"Employee",value:42},{name:"Manager",value:12},{name:"Admin",value:2}];
const monthlyRegs    = [{month:"Oct",users:8},{month:"Nov",users:14},{month:"Dec",users:6},{month:"Jan",users:18},{month:"Feb",users:22},{month:"Mar",users:15}];
const deptHeadcount  = [{dept:"Eng",count:18},{dept:"Sales",count:12},{dept:"HR",count:8},{dept:"Finance",count:10},{dept:"Mktg",count:8}];
const attendanceRate = [{month:"Oct",rate:88},{month:"Nov",rate:91},{month:"Dec",rate:79},{month:"Jan",rate:85},{month:"Feb",rate:93},{month:"Mar",rate:90}];
const taskStatus     = [{name:"Completed",value:68},{name:"In Progress",value:22},{name:"Pending",value:10}];
const deptCompletion = [{dept:"Engineering",pct:84},{dept:"Finance",pct:78},{dept:"HR",pct:72},{dept:"Sales",pct:69},{dept:"Marketing",pct:61}];

const StatCard = ({bg,label,value,icon}) => (
  <div style={{background:bg,borderRadius:14,padding:"22px 24px",color:"#fff",display:"flex",alignItems:"center",gap:16}}>
    <div style={{fontSize:32}}>{icon}</div>
    <div>
      <div style={{fontSize:34,fontWeight:800,lineHeight:1}}>{value}</div>
      <div style={{fontSize:13,opacity:0.85,marginTop:4}}>{label}</div>
    </div>
  </div>
);
const ChartCard = ({title,children}) => (
  <div style={{background:"#fff",borderRadius:14,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
    <div style={{fontWeight:700,fontSize:15,color:"#1a1a2e",marginBottom:16}}>{title}</div>
    {children}
  </div>
);
export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <div style={{display:"flex"}}>
        <Sidebar />
        <main style={{flex:1,padding:32,background:"#f4f6fb",minHeight:"calc(100vh - 60px)"}}>
          <h1 style={{fontSize:26,fontWeight:700,color:"#1a1a2e",marginBottom:4}}>Admin Dashboard</h1>
          <p style={{color:"#888",marginBottom:28}}>Welcome back, {user?.name}. Here is your system overview.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:28}}>
            <StatCard bg="linear-gradient(135deg,#6366f1,#8b5cf6)" label="Total Users" value={56} icon="Users" />
            <StatCard bg="linear-gradient(135deg,#ec4899,#f43f5e)" label="Total Tasks" value={89} icon="Tasks" />
            <StatCard bg="linear-gradient(135deg,#10b981,#059669)" label="Attendance Records" value={234} icon="Attend" />
            <StatCard bg="linear-gradient(135deg,#f59e0b,#d97706)" label="Departments" value={5} icon="Depts" />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
            <ChartCard title="Users by Role">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({name,percent})=>name+" "+(percent*100).toFixed(0)+"%"}>
                    {usersByRole.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Monthly New Registrations">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyRegs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} dot={{r:5}} activeDot={{r:7}} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24}}>
            <ChartCard title="Department Headcount">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptHeadcount}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dept" tick={{fontSize:12}} /><YAxis tick={{fontSize:12}} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {deptHeadcount.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Monthly Attendance Rate (%)">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={attendanceRate}>
                  <defs><linearGradient id="aG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{fontSize:12}} /><YAxis domain={[60,100]} tick={{fontSize:12}} />
                  <Tooltip formatter={(v)=>v+"%"} />
                  <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} fill="url(#aG)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <ChartCard title="Overall Task Status">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={taskStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value" label={({name,percent})=>name+" "+(percent*100).toFixed(0)+"%"}>
                    {taskStatus.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Task Completion by Department (%)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptCompletion} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0,100]} tick={{fontSize:12}} />
                  <YAxis type="category" dataKey="dept" width={90} tick={{fontSize:12}} />
                  <Tooltip formatter={(v)=>v+"%"} />
                  <Bar dataKey="pct" radius={[0,6,6,0]}>
                    {deptCompletion.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </main>
      </div>
    </>
  );
}