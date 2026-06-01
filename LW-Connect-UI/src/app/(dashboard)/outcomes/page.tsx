"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Award, DollarSign, Target, BarChart3 } from "lucide-react";

interface OutcomesDashboard {
  total_learners: number;
  completion_rate: number;
  average_skill_improvement: number;
  career_progressions: number;
  program_roi: number;
  top_skills_improved: Array<{ skill: string; improvement: number }>;
}

export default function OutcomesDashboardPage() {
  const [data, setData] = useState<OutcomesDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/outcomes/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading outcomes...</div>;
  if (!data) return <div className="p-8">No data available</div>;

  const metrics = [
    {
      title: "Total Learners",
      value: data.total_learners,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Completion Rate",
      value: `${data.completion_rate.toFixed(1)}%`,
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Avg Skill Improvement",
      value: `${data.average_skill_improvement.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Career Progressions",
      value: data.career_progressions,
      icon: Award,
      color: "text-orange-600",
    },
    {
      title: "Program ROI",
      value: `${data.program_roi.toFixed(1)}%`,
      icon: DollarSign,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Measurable Outcomes Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track learning impact, skill improvement, and program ROI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Skills Improved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_skills_improved.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-medium">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(skill.improvement, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      +{skill.improvement.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
              {data.top_skills_improved.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No skill improvements recorded yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI Calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium">Return on Investment</span>
                <span className="text-2xl font-bold text-green-600">
                  {data.program_roi.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  • Completion rate: <strong>{data.completion_rate.toFixed(1)}%</strong> (Industry avg: 45%)
                </p>
                <p>
                  • Skill improvement: <strong>{data.average_skill_improvement.toFixed(1)}%</strong>
                </p>
                <p>
                  • Career progressions: <strong>{data.career_progressions}</strong> learners
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500">
                  ROI calculated based on productivity gains, cost savings, and career advancement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              The LW-Connect platform has achieved a <strong>{data.completion_rate.toFixed(1)}%</strong> completion rate,
              significantly higher than the industry average of 45%. Learners have shown an average skill improvement
              of <strong>{data.average_skill_improvement.toFixed(1)}%</strong>, with <strong>{data.career_progressions}</strong> documented
              career progressions. The program delivers a <strong>{data.program_roi.toFixed(1)}%</strong> return on investment,
              demonstrating measurable value for government training initiatives.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
