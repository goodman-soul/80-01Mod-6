import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  Select,
  Form,
  message,
  Card,
  Statistic,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../../shared/api';
import type {
  VisitApplication,
  VisitStatus,
} from '../../shared/types';
import {
  statusLabels,
} from '../../shared/types';

const STEWARD_ID = 's001';
const STEWARD_NAME = '刘管家';

function VisitReview() {
  const [applications, setApplications] = useState<VisitApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentApp, setCurrentApp] = useState<VisitApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getVisitApplications(
        undefined,
        statusFilter === 'all' ? undefined : statusFilter,
      );
      setApplications(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (error) {
      message.error('加载数据失败');
    }
    setLoading(false);
  };

  const handleApprove = async (record: VisitApplication) => {
    Modal.confirm({
      title: '确认通过',
      content: `确认通过 ${record.applicantName} 的探访申请？通过后将自动生成探访二维码。`,
      onOk: async () => {
        try {
          await api.approveVisit(record.id, STEWARD_ID, STEWARD_NAME);
          message.success('审核通过');
          loadApplications();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleReject = (record: VisitApplication) => {
    setCurrentApp(record);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('请填写拒绝原因');
      return;
    }

    try {
      await api.rejectVisit(
        currentApp!.id,
        STEWARD_ID,
        STEWARD_NAME,
        rejectReason,
      );
      message.success('已拒绝');
      setRejectModalVisible(false);
      loadApplications();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const showDetail = (record: VisitApplication) => {
    setCurrentApp(record);
    setDetailModalVisible(true);
  };

  const statusColorMap: Record<VisitStatus, string> = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    expired: 'default',
  };

  const columns: ColumnsType<VisitApplication> = [
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'applicantPhone',
      key: 'applicantPhone',
      width: 120,
    },
    {
      title: '关系',
      dataIndex: 'relation',
      key: 'relation',
      width: 80,
    },
    {
      title: '探访日期',
      dataIndex: 'visitDate',
      key: 'visitDate',
      width: 120,
    },
    {
      title: '探访时段',
      dataIndex: 'visitTime',
      key: 'visitTime',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: VisitStatus) => (
        <Tag color={statusColorMap[status]}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: VisitApplication) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter(
    (a) => a.status === 'approved',
  ).length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核申请"
              value={pendingCount}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日通过"
              value={approvedCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="本月探访" value={applications.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待跟进事项" value={3} valueStyle={{ color: '#f5222d' }} />
          </Card>
        </Col>
      </Row>

      <div className="page-card">
        <div className="card-header">
          <div className="card-title">探访申请列表</div>
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部' },
                { value: 'pending', label: '待审核' },
                { value: 'approved', label: '已通过' },
                { value: 'rejected', label: '已拒绝' },
              ]}
            />
            <Button onClick={loadApplications}>刷新</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="申请详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={500}
      >
        {currentApp && (
          <div className="detail-modal">
            <div className="detail-item">
              <span className="label">申请人：</span>
              <span className="value">{currentApp.applicantName}</span>
            </div>
            <div className="detail-item">
              <span className="label">联系电话：</span>
              <span className="value">{currentApp.applicantPhone}</span>
            </div>
            <div className="detail-item">
              <span className="label">与老人关系：</span>
              <span className="value">{currentApp.relation}</span>
            </div>
            <div className="detail-item">
              <span className="label">探访日期：</span>
              <span className="value">{currentApp.visitDate}</span>
            </div>
            <div className="detail-item">
              <span className="label">探访时段：</span>
              <span className="value">{currentApp.visitTime}</span>
            </div>
            <div className="detail-item">
              <span className="label">探访事由：</span>
              <span className="value">{currentApp.reason || '无'}</span>
            </div>
            <div className="detail-item">
              <span className="label">申请状态：</span>
              <span className="value">
                <Tag color={statusColorMap[currentApp.status as VisitStatus]}>
                  {statusLabels[currentApp.status as VisitStatus]}
                </Tag>
              </span>
            </div>
            {currentApp.rejectReason && (
              <div className="detail-item">
                <span className="label">拒绝原因：</span>
                <span className="value">{currentApp.rejectReason}</span>
              </div>
            )}
            {currentApp.qrCode && (
              <div className="detail-item">
                <span className="label">二维码：</span>
                <span className="value" style={{ color: '#52c41a' }}>
                  已生成
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="拒绝申请"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="确认拒绝"
        okButtonProps={{ danger: true }}
      >
        <Form layout="vertical">
          <Form.Item label="拒绝原因" required>
            <Input.TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="请填写拒绝原因..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default VisitReview;
