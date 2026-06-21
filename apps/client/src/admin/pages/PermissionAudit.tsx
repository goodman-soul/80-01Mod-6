import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Select,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../../shared/api';
import type {
  AuditLog,
  AuditAction,
} from '../../shared/types';
import {
  permissionLabels,
  auditActionLabels,
} from '../../shared/types';

const ELDERLY_ID = 'e001';

function PermissionAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs(ELDERLY_ID);

      let filtered = data;
      if (actionFilter !== 'all') {
        filtered = data.filter((log) => log.action === actionFilter);
      }

      setLogs(
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      message.error('加载数据失败');
    }
    setLoading(false);
  };

  const showDetail = (record: AuditLog) => {
    setCurrentLog(record);
    setDetailModalVisible(true);
  };

  const actionColorMap: Record<AuditAction, string> = {
    permission_add: 'green',
    permission_remove: 'red',
    permission_update: 'blue',
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: AuditAction) => (
        <Tag color={actionColorMap[action]}>
          {auditActionLabels[action]}
        </Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
    },
    {
      title: '操作对象',
      dataIndex: 'familyMemberName',
      key: 'familyMemberName',
      width: 120,
    },
    {
      title: '变更内容',
      key: 'permissions',
      width: 300,
      render: (_: unknown, record: AuditLog) => {
        const added = record.newPermissions.filter(
          (p) => !record.oldPermissions.includes(p),
        );
        const removed = record.oldPermissions.filter(
          (p) => !record.newPermissions.includes(p),
        );
        return (
          <Space size={4} wrap>
            {removed.map((p) => (
              <Tag key={`r-${p}`} color="red" style={{ textDecoration: 'line-through' }}>
                - {permissionLabels[p]}
              </Tag>
            ))}
            {added.map((p) => (
              <Tag key={`a-${p}`} color="green">
                + {permissionLabels[p]}
              </Tag>
            ))}
            {added.length === 0 && removed.length === 0 && (
              <span style={{ color: '#999' }}>无变化</span>
            )}
          </Space>
        );
      },
    },
    {
      title: '变更原因',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: AuditLog) => (
        <Button type="link" size="small" onClick={() => showDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  const addCount = logs.filter((l) => l.action === 'permission_add').length;
  const removeCount = logs.filter((l) => l.action === 'permission_remove').length;
  const updateCount = logs.filter((l) => l.action === 'permission_update').length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
        <Card>
          <Statistic
            title="总变更次数"
            value={logs.length}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="新增权限"
            value={addCount}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="移除权限"
            value={removeCount}
            valueStyle={{ color: '#f5222d' }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="修改权限"
            value={updateCount}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>
    </Row>

      <div className="page-card">
        <div className="card-header">
          <div className="card-title">权限变更审计日志</div>
          <Space>
            <Select
              value={actionFilter}
              onChange={setActionFilter}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部操作' },
                { value: 'permission_add', label: '添加权限' },
                { value: 'permission_remove', label: '移除权限' },
                { value: 'permission_update', label: '修改权限' },
              ]}
            />
            <Button onClick={loadLogs}>刷新</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="审计日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={500}
      >
        {currentLog && (
          <div className="detail-modal">
            <div className="detail-item">
              <span className="label">操作类型：</span>
              <span className="value">
                <Tag color={actionColorMap[currentLog.action]}>
                  {auditActionLabels[currentLog.action]}
                </Tag>
              </span>
            </div>
            <div className="detail-item">
              <span className="label">操作人：</span>
              <span className="value">{currentLog.operatorName}</span>
            </div>
            <div className="detail-item">
              <span className="label">操作对象：</span>
              <span className="value">{currentLog.familyMemberName}</span>
            </div>
            <div className="detail-item">
              <span className="label">变更前权限：</span>
              <span className="value">
                {currentLog.oldPermissions.length > 0
                  ? currentLog.oldPermissions
                      .map((p) => permissionLabels[p])
                      .join('、')
                  : '无'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">变更后权限：</span>
              <span className="value">
                {currentLog.newPermissions.length > 0
                  ? currentLog.newPermissions
                      .map((p) => permissionLabels[p])
                      .join('、')
                  : '无'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">变更原因：</span>
              <span className="value">{currentLog.remark || '无'}</span>
            </div>
            <div className="detail-item">
              <span className="label">操作时间：</span>
              <span className="value">
                {new Date(currentLog.createdAt).toLocaleString('zh-CN')}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PermissionAudit;
