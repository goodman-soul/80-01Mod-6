import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../shared/api';
import type { PermissionType, ServiceRecord, HealthReminder, Photo } from '../../shared/types';

const FAMILY_MEMBER_ID = 'fm001';

const typeLabels: Record<string, string> = {
  service_records: '服务记录',
  health_reminders: '健康提醒',
  photos: '照片',
};

function ContentView() {
  const { type } = useParams<{ type: string }>();
  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type) {
      loadContent();
    }
  }, [type]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAuthorizedContent(FAMILY_MEMBER_ID, type as PermissionType);
      setData(result as unknown[]);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderServiceRecords = () => {
    const records = data as ServiceRecord[];
    return records.map((record) => (
      <div
        key={record.id}
        style={{
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: '500' }}>{record.type}</span>
          <span style={{ fontSize: '12px', color: '#999' }}>{formatTime(record.createdAt)}</span>
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>{record.content}</div>
      </div>
    ));
  };

  const renderHealthReminders = () => {
    const reminders = data as HealthReminder[];
    return reminders.map((reminder) => (
      <div
        key={reminder.id}
        style={{
          padding: '12px 0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: '500' }}>{reminder.title}</span>
          <span style={{ fontSize: '12px', color: '#1890ff', background: '#e6f7ff', padding: '2px 6px', borderRadius: '4px' }}>
            {reminder.time}
          </span>
        </div>
        <div style={{ fontSize: '13px', color: '#666' }}>{reminder.content}</div>
      </div>
    ));
  };

  const renderPhotos = () => {
    const photos = data as Photo[];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {photos.map((photo) => (
          <div key={photo.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1' }}>
            <img
              src={photo.url}
              alt={photo.description || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {photo.description && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '6px 8px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                color: 'white',
                fontSize: '12px',
              }}>
                {photo.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'service_records':
        return renderServiceRecords();
      case 'health_reminders':
        return renderHealthReminders();
      case 'photos':
        return renderPhotos();
      default:
        return <div className="empty-state">未知类型</div>;
    }
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-title">{typeLabels[type || ''] || '内容'}</div>
        {loading ? (
          <div className="empty-state">加载中...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#f5222d' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
            <div>{error}</div>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">暂无内容</div>
        ) : (
          renderContent()
        )}
      </div>

      <div className="section-card">
        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
          💡 内容可见范围由主要家属设定，如需调整请联系主要家属。
        </div>
      </div>
    </div>
  );
}

export default ContentView;
