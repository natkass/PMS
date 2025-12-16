import React from "react";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import Signin from './Components/PMS/Signin';
import LoginContainer from "./Components/PMS/LoginContainer";
// import Logintry from "./Components/PMS/Logintry";
import { HelmetProvider } from "react-helmet-async";
import Activityadd from "./Components/PMS/Activityadd";
import Addmembertoproject from "./Components/PMS/Addmembertoproject";
import Docs from "./Components/PMS/Docs";
import DocsAdd from "./Components/PMS/DocsAdd";
import DocsEdit from "./Components/PMS/Docsedit";
import FirstResetbackground from "./Components/PMS/FirstResetbackground";
import Login from "./Components/PMS/Login";
import LoginBackground from "./Components/PMS/LoginBackground";
import Organization from "./Components/PMS/Organization";
import Projectcreate from "./Components/PMS/Projectcreate";
import Projects from "./Components/PMS/Projects";
import Settings from "./Components/PMS/Settings";
import Settingstry from "./Components/PMS/Settingstry";
import SideandNav from "./Components/PMS/SideandNav";
import Trash from "./Components/PMS/Trash";

import RequireAuth from "./context/RequireAuth";

import EditUser from "./Components/PMS/EditUsers";

import Editorganization from "./Components/PMS/Editorganization";
import Notification from "./Components/PMS/Notification";
import Teamstry from "./Components/PMS/Teamstry";

import Milestone from "./Components/PMS/Milestone";
import Myprofile from "./Components/PMS/Myprofile";
import Workspace from "./Components/PMS/Workspace";

import WorkspaceAssignMember from "./Components/PMS/WorkspaceAssignMember";

import Navbar from "./Components/PMS/Navbar";
import RoleDelete from "./Components/PMS/RoleDelete";
import RoleEdit from "./Components/PMS/RoleEdit";
import RoleView from "./Components/PMS/RoleView";
import Sidebar from "./Components/PMS/Sidebar";
// import Projectdelete from "./Components/PMS/Projectdelete";
import ForgetPasswordContainer from "./Components/PMS/ForgetPasswordContainer";
import Teams from "./Components/PMS/Teams";
// import Calander from './Components/PMS/Calander';
import Createnewproject from "./Components/PMS/Createnewproject";
import Createnewteam from "./Components/PMS/Createnewteam";
import Division from "./Components/PMS/Division";
import DivisionAdd from "./Components/PMS/DivisionAdd";
import Employees from "./Components/PMS/Employees";
import ForgetPassword from "./Components/PMS/ForgetPassword";
import Members from "./Components/PMS/Members";
import Registernewuser from "./Components/PMS/Registernewuser";
import ResetPasswordContainer from "./Components/PMS/ResetPasswordContainer";
import ResetPasswordbody from "./Components/PMS/ResetPasswordbody";

import Addorganizationprofile from "./Components/PMS/Addorganizationprofile";
import RoleAdd from "./Components/PMS/RoleAdd";
import SectorAdd from "./Components/PMS/SectorAdd";
import SectorEdit from "./Components/PMS/SectorEdit";
import Sectors from "./Components/PMS/Sectors";
import Sectorstry from "./Components/PMS/Sectorstry";
import SettingsShow from "./Components/PMS/SettingsShow";
import Trashtry from "./Components/PMS/Trashtry";
import Users from "./Components/PMS/Users";
import Checkboxtest from "./Components/PMS/checkboxtest";

import Assign from "./Components/PMS/Assign";
import FirstReset from "./Components/PMS/FirstReset";
import Footer from "./Components/PMS/Footer";

import Organizationaluniteditt from "./Components/PMS/Organizationaluniteditt";

import Organizationalunits from "./Components/PMS/Organizationalunits";
import WorkspaceAddMajorTask from "./Components/PMS/WorkspaceAddMajorTask";
import WorkspaceAddSubTask from "./Components/PMS/WorkspaceAddSubTask";
import WorkspaceEditMajorTask from "./Components/PMS/WorkspaceEditMajorTask";

import Activity from "./Components/PMS/Activity";

import Addorganization from "./Components/PMS/Addorganization";

// import Projectsedit from "./Components/PMS/Projectsedit";

import FirstResetcontainer from "./Components/PMS/FirstResetcontainer";
import Organizationalunittry from "./Components/PMS/Organizationalunittry";
import Viewprofile from "./Components/PMS/Viewprofile";
import WorkspaceEditSubtask from "./Components/PMS/WorkspaceEditSubtask";
import { useAuth } from "./context/authContext";

function App() {
  const auth = useAuth();

  return (
    <HelmetProvider>
      <Router exact basename="/pms">
        <Routes>
          <Route  path="/" element={<Login />} />
          <Route path="/FirstReset" element={<FirstReset />} />
          {/* <Route exact path="/home/*" element={<MainRoutes />} /> */}
          <Route
            path="/home/*"
            element={
              <RequireAuth>
                <SideandNav />
              </RequireAuth>
            }
          />

          {/* <Route path="/logintry" element={<Logintry />} /> */}
          {/* <Route path="/projectsedit" element={<Projectsedit />} /> */}
          <Route path="/projectcreate" element={<Projectcreate />} />
          <Route path="/Teamstry" element={<Teamstry />} />
          <Route
            path="/Addorganizationprofile"
            element={<Addorganizationprofile />}
          />
          <Route
            path="/Organizationalunittry"
            element={<Organizationalunittry />}
          />

          <Route path="/logincontainer" element={<LoginContainer />} />
          <Route path="/checkboxtest" element={<Checkboxtest />} />
          <Route path="/Notification" element={<Notification />} />

          <Route path="/trash" element={<Trash />} />
          <Route path="/Activityadd" element={<Activityadd />} />

          <Route path="/EditUser" element={<EditUser />} />

          <Route path="/members" element={<Members />} />
          <Route path="/Addorganization" element={<Addorganization />} />

          <Route path="/organization" element={<Organization />} />

          <Route path="/assign" element={<Assign />} />
          {/* <Route path="/Projectdelete" element={<Projectdelete />} /> */}
          {/* <Route path="/Footer" element={<Footer />} /> */}
          <Route path="/Addmembertoproject" element={<Addmembertoproject />} />

          <Route path="/Workspace" element={<Workspace />} />
          <Route
            path="/WorkspaceAssignMember"
            element={<WorkspaceAssignMember />}
          />
          <Route
            path="/WorkspaceEditMajorTask"
            element={<WorkspaceEditMajorTask />}
          />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route
            path="/FirstResetcontainer"
            element={<FirstResetcontainer />}
          />
          <Route
            path="/FirstResetbackground"
            element={<FirstResetbackground />}
          />

          <Route path="/SettingsShow" element={<SettingsShow />} />
          <Route path="/Milestone" element={<Milestone />} />

          <Route path="/viewprofile" element={<Viewprofile />} />
          <Route path="/Docs" element={<Docs />} />
          <Route path="/DocsAdd" element={<DocsAdd />} />
          <Route path="/DocsEdit" element={<DocsEdit />} />
          <Route path="/Editorganization" element={<Editorganization />} />

          <Route path="/Footer" element={<Footer />} />

          <Route
            path="/forgetpasswordcontainer"
            element={<ForgetPasswordContainer />}
          />
          {/* <Route path="/calander" element={<Calander />} /> */}
          {/* <Route path="/home" element={<Home />} /> */}
          <Route path="/myprofile" element={<Myprofile />} />
          <Route path="/Activity" element={<Activity />} />
          <Route path="/ResetPasswordbody" element={<ResetPasswordbody />} />
          <Route
            path="/ResetPasswordContainer"
            element={<ResetPasswordContainer />}
          />
          <Route path="/LoginBackground" element={<LoginBackground />} />
          {/* <Route path="/Login" element={<Login />} /> */}
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/navbar" element={<Navbar />} />
          <Route path="/users" element={<Users />} />
          <Route path="/createnewteam" element={<Createnewteam />} />
          <Route path="/DivisionAdd" element={<DivisionAdd />} />
          <Route
            path="/WorkspaceAddMajorTask"
            element={<WorkspaceAddMajorTask />}
          />
          <Route
            path="/WorkspaceAddSubTask"
            element={<WorkspaceAddSubTask />}
          />

          <Route path="/teams" element={<Teams />} />
          <Route path="/Trashtry" element={<Trashtry />} />

          <Route path="/roleview" element={<RoleView />} />
          <Route path="/roleedit" element={<RoleEdit />} />
          <Route path="/roledelete" element={<RoleDelete />} />
          <Route path="/roleadd" element={<RoleAdd />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settingstry" element={<Settingstry />} />
          <Route path="/Projects" element={<Projects />} />

          <Route path="/sectors" element={<Sectors />} />
          <Route path="/sectorstry" element={<Sectorstry />} />

          <Route
            path="/organizationalunits"
            element={<Organizationalunits />}
          />
          <Route
            path="/Organizationaluniteditt"
            element={<Organizationaluniteditt />}
          />
          <Route path="/sectoradd" element={<SectorAdd />} />
          <Route path="/sectoredit" element={<SectorEdit />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/createnewproject" element={<Createnewproject />} />
          <Route path="/registernewuser" element={<Registernewuser />} />
          <Route path="/division" element={<Division />} />

          <Route
            path="/WorkspaceEditSubtask"
            element={<WorkspaceEditSubtask />}
          />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
