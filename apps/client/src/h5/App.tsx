import { Routes, Route } from 'react-router-dom';
import { NavBar } from 'antd-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import FamilyList from './pages/FamilyList';
import PermissionEdit from './pages/PermissionEdit';
import VisitApply from './pages/VisitApply';
import VisitList from './pages/VisitList';
import VisitDetail from './pages/VisitDetail';
import MessageList from './pages/MessageList';
import AuditLog from './pages/AuditLog';
import ContentView from './pages/ContentView';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const showBack = location.pathname !== '/';

  const pageTitles: Record<string, string> = {
    '/family': '家属管理',
    '/permission': '权限设置',
    '/visit': '探访申请',
    '/visit/list': '我的探访',
    '/visit/apply': '申请探访',
    '/messages': '家属留言',
    '/audit': '审计日志',
    '/content': '内容查看',
  };

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path)) {
        return title;
      }
    }
    return '社区养老';
  };

  return (
    <div className="h5-container">
      {showBack && (
        <NavBar
          onBack={() => navigate(-1)}
          style={{ background: 'white', position: 'sticky', top: 0, zIndex: 10 }}
        >
          {getTitle()}
        </NavBar>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/family" element={<FamilyList />} />
        <Route path="/permission/:id" element={<PermissionEdit />} />
        <Route path="/visit/list" element={<VisitList />} />
        <Route path="/visit/apply" element={<VisitApply />} />
        <Route path="/visit/:id" element={<VisitDetail />} />
        <Route path="/messages" element={<MessageList />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="/content/:type" element={<ContentView />} />
      </Routes>
    </div>
  );
}

export default App;
