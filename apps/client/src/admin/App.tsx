import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import VisitReview from './pages/VisitReview';
import FollowUpItems from './pages/FollowUpItems';
import PermissionAudit from './pages/PermissionAudit';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/visit-review', label: '探访审核', icon: '👋' },
    { key: '/follow-up', label: '跟进事项', icon: '📋' },
    { key: '/permission-audit', label: '权限审计', icon: '🔍' },
  ];

  const getPageTitle = () => {
    const item = menuItems.find((m) => location.pathname.startsWith(m.key));
    return item?.label || '管理控制台';
  };

  const isActive = (key: string) => {
    return location.pathname.startsWith(key);
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="logo">🏠 社区养老平台</div>
        <div className="menu">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`menu-item ${isActive(item.key) ? 'active' : ''}`}
              onClick={() => navigate(item.key)}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="page-title">{getPageTitle()}</div>
          <div className="user-info">
            <div className="avatar">管</div>
            <span>刘管家</span>
          </div>
        </div>

        <div className="content">
          <Routes>
            <Route path="/" element={<VisitReview />} />
            <Route path="/visit-review" element={<VisitReview />} />
            <Route path="/follow-up" element={<FollowUpItems />} />
            <Route path="/permission-audit" element={<PermissionAudit />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
