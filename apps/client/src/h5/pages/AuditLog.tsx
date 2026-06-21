import { useState, useEffect } from 'react';
import { api } from '../../shared/api';
import type { AuditLog } from '../../shared/types';
import { permissionLabels, auditActionLabels } from '../../shared/types';

const ELDERLY_ID = 'e001';

function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(ELDERLY_ID);
      setLogs(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('加载审计日志失败', error);
    }
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const diffPermissions = (oldPerms: string[], newPerms: string[]) => {
    const added = newPerms.filter((p) => !oldPerms.includes(p));
    const removed = oldPerms.filter((p) => !newPerms.includes(p));
    return { added, removed };
  };

  return (
    <div>
      <div className="section-card">
        <div className="section-title">
          权限变更记录
          <span className="more">共 {logs.length} 条</span>
        </div>

        {loading ? (
          <div className="empty-state">加载中...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">暂无变更记录</div>
        ) : (
          logs.map((log) => {
            const { added, removed } = diffPermissions(log.oldPermissions, log.newPermissions);
            return (
              <div key={log.id} className="audit-item">
                <div className="audit-header">
                  <span className="action">
                    {auditActionLabels[log.action]}
                  </span>
                  <span className="time">{formatTime(log.createdAt)}</span>
                </div>
                <div className="audit-detail">
                  <span className="operator">{log.operatorName}</span>
                  {' 对 '}
                  <span className="member">{log.familyMemberName}</span>
                  {' 的权限进行了变更'}
                </div>
                {log.remark && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    原因：{log.remark}
                  </div>
                )}
                <div className="permission-changes">
                  {removed.length > 0 && (
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#f5222d', fontSize: '12px' }}>移除：</span>
                      {removed.map((p) => (
                        <span key={p} className="perm-tag old">
                          {permissionLabels[p as keyof typeof permissionLabels]}
                        </span>
                      ))}
                    </div>
                  )}
                  {added.length > 0 && (
                    <div>
                      <span style={{ color: '#52c41a', fontSize: '12px' }}>新增：</span>
                      {added.map((p) => (
                        <span key={p} className="perm-tag new">
                          {permissionLabels[p as keyof typeof permissionLabels]}
                        </span>
                      ))}
                    </div>
                  )}
                  {added.length === 0 && removed.length === 0 && log.oldPermissions.length > 0 && (
                    <div>
                      <span style={{ color: '#999', fontSize: '12px' }}>当前权限：</span>
                      {log.oldPermissions.map((p) => (
                        <span key={p} className="perm-tag new" style={{ background: '#f5f5f5', color: '#666' }}>
                          {permissionLabels[p as keyof typeof permissionLabels]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="section-card">
        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
          <p>📋 关于审计日志：</p>
          <p>• 所有权限变更操作都会被记录</p>
          <p>• 记录包含操作人、操作时间、变更内容</p>
          <p>• 记录不可删除、不可篡改</p>
          <p>• 主要家属可查看全部审计记录</p>
        </div>
      </div>
    </div>
  );
}

export default AuditLogPage;
