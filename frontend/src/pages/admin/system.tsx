import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon, 
  CogIcon, 
  DatabaseIcon, 
  DownloadIcon, 
  RefreshCwIcon, 
  SaveIcon, 
  ServerIcon,
  ShieldIcon
} from "lucide-react";
import { useState } from "react";

export default function SystemManagement() {
  const [tabIndex, setTabIndex] = useState(0);
  
  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">系统管理</h1>
      </div>
      
      <div className="flex border-b">
        <Button 
          variant={tabIndex === 0 ? "default" : "ghost"} 
          className={`rounded-none ${tabIndex === 0 ? '' : 'hover:text-primary'}`}
          onClick={() => setTabIndex(0)}
        >
          系统信息
        </Button>
        <Button 
          variant={tabIndex === 1 ? "default" : "ghost"} 
          className={`rounded-none ${tabIndex === 1 ? '' : 'hover:text-primary'}`}
          onClick={() => setTabIndex(1)}
        >
          数据备份
        </Button>
        <Button 
          variant={tabIndex === 2 ? "default" : "ghost"} 
          className={`rounded-none ${tabIndex === 2 ? '' : 'hover:text-primary'}`}
          onClick={() => setTabIndex(2)}
        >
          安全设置
        </Button>
        <Button 
          variant={tabIndex === 3 ? "default" : "ghost"} 
          className={`rounded-none ${tabIndex === 3 ? '' : 'hover:text-primary'}`}
          onClick={() => setTabIndex(3)}
        >
          系统配置
        </Button>
        <Button 
          variant={tabIndex === 4 ? "default" : "ghost"} 
          className={`rounded-none ${tabIndex === 4 ? '' : 'hover:text-primary'}`}
          onClick={() => setTabIndex(4)}
        >
          操作日志
        </Button>
      </div>
      
      {/* 系统信息 */}
      {tabIndex === 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>系统概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ServerIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">系统版本</span>
                    </div>
                    <p className="text-sm">1.2.5</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CogIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">最后更新</span>
                    </div>
                    <p className="text-sm">2025-04-01</p>
                  </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU 使用率</span>
                    <span>28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>内存使用率</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>存储使用率</span>
                    <span>62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="gap-2">
                    <RefreshCwIcon className="h-4 w-4" />
                    刷新系统状态
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>系统性能监控</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">服务器响应时间（毫秒）</h3>
                  <div className="h-[120px] flex items-end gap-1">
                    {[45, 50, 35, 40, 55, 60, 48, 53, 47, 42, 38, 41].map((value, index) => (
                      <div 
                        key={index} 
                        className="bg-primary h-full rounded-sm" 
                        style={{ 
                          height: `${value}%`,
                          width: 'calc(100% / 12 - 4px)' 
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>10:00</span>
                    <span>11:00</span>
                    <span>12:00</span>
                    <span>13:00</span>
                    <span>14:00</span>
                    <span>15:00</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">平均响应时间</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">42</span>
                      <span className="text-sm text-muted-foreground">ms</span>
                      <ArrowDownIcon className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500">-5%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">系统负载</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">1.24</span>
                      <ArrowUpIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-yellow-500">+12%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">在线用户数</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">286</span>
                      <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500">+24%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">错误率</p>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">0.8%</span>
                      <ArrowDownIcon className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-500">-0.3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 数据备份 */}
      {tabIndex === 1 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>备份管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between pb-4 border-b">
                  <div>
                    <h3 className="font-medium">自动备份</h3>
                    <p className="text-sm text-muted-foreground">每日凌晨3点自动备份系统数据</p>
                  </div>
                  <div className="flex items-center h-5">
                    <Checkbox defaultChecked={true} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">备份保留天数</label>
                  <Input type="number" defaultValue={30} min={1} max={365} />
                  <p className="text-xs text-muted-foreground">超过保留天数的备份将被自动删除</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">备份路径</label>
                  <div className="flex gap-2">
                    <Input defaultValue="/backup/ptjobs" className="flex-1" readOnly />
                    <Button variant="outline">选择</Button>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button className="gap-2">
                    <SaveIcon className="h-4 w-4" />
                    立即备份
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>备份记录</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">备份文件</th>
                      <th className="p-2 text-left font-medium">大小</th>
                      <th className="p-2 text-left font-medium">时间</th>
                      <th className="p-2 text-center font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'backup_20250413_030000.zip', size: '124MB', date: '2025-04-13 03:00' },
                      { name: 'backup_20250412_030000.zip', size: '120MB', date: '2025-04-12 03:00' },
                      { name: 'backup_20250411_030000.zip', size: '118MB', date: '2025-04-11 03:00' },
                      { name: 'backup_20250410_030000.zip', size: '115MB', date: '2025-04-10 03:00' },
                      { name: 'backup_20250409_030000.zip', size: '110MB', date: '2025-04-09 03:00' },
                    ].map((backup, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{backup.name}</td>
                        <td className="p-2">{backup.size}</td>
                        <td className="p-2">{backup.date}</td>
                        <td className="p-2">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <DownloadIcon className="h-4 w-4" />
                              <span className="sr-only">下载</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 安全设置 */}
      {tabIndex === 2 && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>安全配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">密码策略</label>
                    </div>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-1">
                      <option value="low">低（最少6位，包含字母和数字）</option>
                      <option value="medium" selected>中（最少8位，包含大小写字母和数字）</option>
                      <option value="high">高（最少10位，包含大小写字母、数字和特殊字符）</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">密码有效期（天）</label>
                    </div>
                    <Input type="number" defaultValue={90} min={30} max={365} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">登录失败锁定阈值</label>
                    </div>
                    <Input type="number" defaultValue={5} min={1} max={10} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">账号锁定时长（分钟）</label>
                    </div>
                    <Input type="number" defaultValue={30} min={5} max={1440} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">启用双因素认证</label>
                    <Checkbox defaultChecked={false} />
                  </div>
                  <p className="text-xs text-muted-foreground">为管理员账号启用双因素认证，提高系统安全性</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">登录IP限制</label>
                    <Checkbox defaultChecked={true} />
                  </div>
                  <Textarea 
                    placeholder="请输入允许的IP地址，每行一个" 
                    className="min-h-[100px]"
                    defaultValue="192.168.1.0/24&#10;10.0.0.1&#10;127.0.0.1"
                  />
                </div>

                <Button className="gap-2">
                  <ShieldIcon className="h-4 w-4" />
                  保存安全设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 系统配置 */}
      {tabIndex === 3 && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>基本配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">系统名称</label>
                    </div>
                    <Input defaultValue="兼职招聘管理系统" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">系统Logo URL</label>
                    </div>
                    <Input defaultValue="/assets/logo.png" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">系统主题色</label>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        defaultValue="#3b82f6" 
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input defaultValue="#3b82f6" className="flex-1" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">默认语言</label>
                    </div>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-1">
                      <option value="zh-CN" selected>简体中文</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">系统公告</label>
                  </div>
                  <Textarea 
                    placeholder="系统公告内容，支持基本格式" 
                    className="min-h-[100px]"
                    defaultValue="欢迎使用兼职招聘管理系统，如有问题请联系管理员。"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">启用维护模式</label>
                    <Checkbox defaultChecked={false} />
                  </div>
                  <p className="text-xs text-muted-foreground">开启后，只有管理员可以访问系统</p>
                </div>

                <Button className="gap-2">
                  <CogIcon className="h-4 w-4" />
                  保存系统配置
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>数据库配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">数据库类型</label>
                    </div>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-1">
                      <option value="sqlite" selected>SQLite</option>
                      <option value="mysql">MySQL</option>
                      <option value="postgresql">PostgreSQL</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">数据库路径</label>
                    </div>
                    <Input defaultValue="/data/database.db" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">数据库状态：</span>
                    <span className="text-green-500">正常</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">数据库优化</label>
                  </div>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-1">
                    <option value="1">每天</option>
                    <option value="7" selected>每周</option>
                    <option value="30">每月</option>
                    <option value="0">从不</option>
                  </select>
                </div>

                <div className="space-y-2 pt-4 flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <CheckIcon className="h-4 w-4" />
                    测试连接
                  </Button>
                  <Button className="gap-2">
                    <DatabaseIcon className="h-4 w-4" />
                    保存数据库配置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 操作日志 */}
      {tabIndex === 4 && (
        <div className="grid gap-4">
          <Card>
            <CardHeader className="p-4 flex flex-row items-center justify-between">
              <CardTitle>操作日志</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="搜索日志..."
                  className="max-w-[200px]"
                />
                <Button variant="outline">搜索</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">操作人</th>
                      <th className="p-2 text-left font-medium">操作类型</th>
                      <th className="p-2 text-left font-medium">操作内容</th>
                      <th className="p-2 text-left font-medium">IP地址</th>
                      <th className="p-2 text-left font-medium">操作时间</th>
                      <th className="p-2 text-left font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { user: '管理员', type: '登录', content: '管理员登录系统', ip: '192.168.1.100', time: '2025-04-13 16:45:30', status: '成功' },
                      { user: '管理员', type: '审核', content: '审核企业：未来科技有限公司', ip: '192.168.1.100', time: '2025-04-13 16:30:22', status: '成功' },
                      { user: '管理员', type: '配置', content: '修改系统配置', ip: '192.168.1.100', time: '2025-04-13 15:40:15', status: '成功' },
                      { user: '张三', type: '登录', content: '用户登录', ip: '114.88.123.45', time: '2025-04-13 15:20:05', status: '失败' },
                      { user: '管理员', type: '备份', content: '执行系统备份', ip: '192.168.1.100', time: '2025-04-13 15:10:45', status: '成功' },
                      { user: '管理员', type: '删除', content: '删除无效职位信息', ip: '192.168.1.100', time: '2025-04-13 14:50:18', status: '成功' },
                      { user: '管理员', type: '审核', content: '审核学生简历', ip: '192.168.1.100', time: '2025-04-13 14:30:50', status: '成功' },
                      { user: '管理员', type: '登录', content: '管理员登录系统', ip: '192.168.1.100', time: '2025-04-13 14:00:10', status: '成功' },
                    ].map((log, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{log.user}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.type === '登录' ? 'bg-blue-100 text-blue-800' :
                            log.type === '审核' ? 'bg-yellow-100 text-yellow-800' :
                            log.type === '配置' ? 'bg-purple-100 text-purple-800' :
                            log.type === '备份' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="p-2">{log.content}</td>
                        <td className="p-2">{log.ip}</td>
                        <td className="p-2">{log.time}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.status === '成功' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  显示 1-8 条记录，共 145 条
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled>上一页</Button>
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">下一页</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
