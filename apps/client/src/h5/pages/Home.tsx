import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd-mobile';
import { api } from '../../shared/api';
import type { Elderly } from '../../shared/types';

const ELDERLY_ID = 'e001';

function Home() {
  const navigate = useNavigate();
  const [elderly, setElderly] = useState<Elderly | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const list = await api.getElderlyList();
      const e = list.find((item) => item.id === ELDERLY_ID);
      setElderly(e || list[0]);

      const items = await api.getFollowUpItems(ELDERLY_ID, 'pending');
      setPendingCount(items.length);
    } catch (error) {
      console.error('加载数据失败', error);
    }
  };

  const functionItems = [
    { icon: '👨‍👩‍👧', label: '家属管理', path: '/family', color: 'blue' },
    { icon: '👋', label: '探访申请', path: '/visit/apply', color: 'green' },
    { icon: '📋', label: '我的探访', path: '/visit/list', color: 'orange' },
    { icon: '📝', label: '家属留言', path: '/messages', color: 'purple' },
    { icon: '📄', label: '服务记录', path: '/content/service_records', color: 'blue' },
    { icon: '💊', label: '健康提醒', path: '/content/health_reminders', color: 'green' },
    { icon: '🖼️', label: '照片', path: '/content/photos', color: 'orange' },
    { icon: '📊', label: '审计日志', path: '/audit', color: 'purple' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="elderly-info">
          <div className="avatar">👵</div>
          <div className="info">
            <div className="name">{elderly?.name || '王秀兰'}</div>
            <div className="room">{elderly?.roomNumber || '3号楼201室'}</div>
          </div>
          {pendingCount > 0 && (
            <Badge content={pendingCount} style={{ '--color': '#f5222d' } as React.CSSProperties}>
              <span style={{ fontSize: '24px' }}>🔔</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">功能入口</div>
        <div className="function-grid">
          {functionItems.map((item, index) => (
            <div
              key={index}
              className="function-item"
              onClick={() => navigate(item.path)}
            >
              <div className={`icon ${item.color}`}>{item.icon}</div>
              <div className="label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div className="section-title">
          待跟进事项
          <span className="more" onClick={() => navigate('/messages')}>
            查看全部
          </span>
        </div>
        {pendingCount > 0 ? (
          <div style={{ color: '#f5222d', fontSize: '14px', padding: '8px 0' }}>
            有 {pendingCount} 条待跟进事项，请及时处理
          </div>
        ) : (
          <div style={{ color: '#52c41a', fontSize: '14px', padding: '8px 0' }}>
            暂无待跟进事项
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="section-title">温馨提示</div>
        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
          <p>• 家属权限变更需经主要家属确认</p>
          <p>• 临时探访需经管家审核后方可进入</p>
          <p>• 留言中涉及跌倒、情绪、投诉会自动生成跟进事项</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
