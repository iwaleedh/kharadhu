import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#FF6B6B', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

export const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.total,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="p-3">
      <CardHeader className="mb-2">
        <CardTitle className="text-base">
          <span className="dhivehi block leading-tight">ބައިތަކުން ހަރަދު</span>
          <span className="text-[10px] text-gray-600 leading-tight">Spending by Category</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="mt-3 space-y-1.5">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.category} className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700 truncate">{item.category}</span>
              </div>
              <span className="font-semibold text-gray-900 ml-2">{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
