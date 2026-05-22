import API from './api';

export const assignReward = async (rewardData) => {
  const { data } = await API.post('/rewards/assign', rewardData);
  return data;
};

export const bulkAssignReward = async (rewardData) => {
  const { data } = await API.post('/rewards/bulk-assign', rewardData);
  return data;
};

export const getRewardHistory = async (employeeId = '') => {
  const url = employeeId ? `/rewards/history?employeeId=${employeeId}` : '/rewards/history';
  const { data } = await API.get(url);
  return data;
};

export const getRewardAnalytics = async () => {
  const { data } = await API.get('/rewards/analytics');
  return data;
};
