import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Select,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Descriptions,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { api } from '../../shared/api';
import type {
  FollowUpItem,
  FollowUpStatus,
  MessageCategory,
} from '../../shared/types';
import {
  categoryLabels,
  followUpStatusLabels,
} from '../../shared/types';

const STEWARD_ID = 's001';

function FollowUpItemsPage() {
  const [items, setItems] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<FollowUpItem | null>(null);

  useEffect(() => {
    loadItems();
  }, [statusFilter, categoryFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.getFollowUpItems(
        undefined,
        statusFilter === 'all' ? undefined : (statusFilter as FollowUpStatus),
      );

      let filtered = data;
      if (categoryFilter !== 'all') {
        filtered = data.filter((item) => item.category === categoryFilter);
      }

      setItems(
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

  const handleStatusChange = async (id: string, status: FollowUpStatus) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认将状态更新为「${followUpStatusLabels[status]}」？`,
      onOk: async () => {
        try {
          await api.updateFollowUpStatus(id, status, STEWARD_ID);
          message.success('状态已更新');
          loadItems();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const showDetail = (record: FollowUpItem) => {
    setCurrentItem(record);
    setDetailModalVisible(true);
  };

  const categoryColorMap: Record<MessageCategory, string> = {
    normal: 'default',
    fall: 'red',
    mood: 'orange',
    complaint: 'red',
  };

  const statusColorMap: Record<FollowUpStatus, string> = {
    pending: 'orange',
    processing: 'blue',
    resolved: 'green',
  };

  const columns: ColumnsType<FollowUpItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: MessageCategory) => (
        <Tag color={categoryColorMap[category]}>
          {categoryLabels[category]}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: FollowUpStatus) => (
        <Tag color={statusColorMap[status]}>
          {followUpStatusLabels[status]}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: FollowUpItem) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusChange(record.id, 'processing')}
            >
              开始处理
            </Button>
          )}
          {record.status === 'processing' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusChange(record.id, 'resolved')}
            >
              标记已解决
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const processingCount = items.filter((i) => i.status === 'processing').length;
  const fallCount = items.filter((i) => i.category === 'fall').length;
  const complaintCount = items.filter((i) => i.category === 'complaint').length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理事项"
              value={pendingCount}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理中"
              value={processingCount}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="跌倒风险"
              value={fallCount}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="投诉"
              value={complaintCount}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="page-card">
        <div className="card-header">
          <div className="card-title">跟进事项列表</div>
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待处理' },
                { value: 'processing', label: '处理中' },
                { value: 'resolved', label: '已解决' },
              ]}
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部分类' },
                { value: 'fall', label: '跌倒风险' },
                { value: 'mood', label: '情绪关注' },
                { value: 'complaint', label: '投诉' },
                { value: 'normal', label: '普通' },
              ]}
            />
            <Button onClick={loadItems}>刷新</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="事项详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          currentItem?.status === 'pending' && (
            <Button
              key="process"
              type="primary"
              onClick={() => {
                handleStatusChange(currentItem.id, 'processing');
                setDetailModalVisible(false);
              }}
            >
              开始处理
            </Button>
          ),
          currentItem?.status === 'processing' && (
            <Button
              key="resolve"
              type="primary"
              onClick={() => {
                handleStatusChange(currentItem.id, 'resolved');
                setDetailModalVisible(false);
              }}
            >
              标记已解决
            </Button>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentItem && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="标题">
              {currentItem.title}
            </Descriptions.Item>
            <Descriptions.Item label="分类">
              <Tag color={categoryColorMap[currentItem.category]}>
                {categoryLabels[currentItem.category]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColorMap[currentItem.status]}>
                {followUpStatusLabels[currentItem.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="描述">
              {currentItem.description}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(currentItem.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            {currentItem.resolvedAt && (
              <Descriptions.Item label="解决时间">
                {new Date(currentItem.resolvedAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default FollowUpItemsPage;
