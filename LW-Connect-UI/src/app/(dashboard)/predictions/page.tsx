"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Users, Target } from "lucide-react";

interface AtRiskLearner {
  user_id: string;
  user_name: string;
  email: string;
  risk_score: number;
  risk_level: string;
  recommended_actions: string[];
}

interface PredictionsDashboard {
  total_learners_analyzed: number;
  high_risk_count: number;
  medium_risk_count: number;
  interventions_needed: number;
  at_risk_learners: AtRiskLearner[];
}

export default function PredictionsPage() {
  const [data, setData] = useState<PredictionsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/predictions/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading predictions...</div>;
  if (!data) return <div className="p-8">No data available</div>;

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-green-600 bg-green-50 border-green-200";
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        <p className="text-gray-600 mt-2">
          AI-powered churn prediction and intervention recommendations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Learners Analyzed
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.total_learners_analyzed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              High Risk
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{data.high_risk_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Medium Risk
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{data.medium_risk_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Interventions Needed
            </CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{data.interventions_needed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>At-Risk Learners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.at_risk_learners.map((learner) => (
              <div
                key={learner.user_id}
                className={`p-4 rounded-lg border-2 ${getRiskColor(learner.risk_level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{learner.user_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getRiskColor(learner.risk_level)}`}>
                        {learner.risk_level} Risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{learner.email}</p>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                      <ul className="text-sm space-y-1">
                        {learner.recommended_actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {(learner.risk_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Risk Score</div>
                  </div>
                </div>
              </div>
            ))}
            {data.at_risk_learners.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No at-risk learners identified. All learners are on track!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Predictions Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-sm text-gray-700">
            <p>
              Our AI analyzes learner engagement patterns including session attendance, booking frequency,
              and activity levels to predict churn risk. Learners are classified as:
            </p>
            <ul className="mt-2 space-y-1">
              <li><strong className="text-red-600">High Risk (70%+)</strong>: Immediate intervention needed</li>
              <li><strong className="text-orange-600">Medium Risk (40-70%)</strong>: Proactive engagement recommended</li>
              <li><strong className="text-green-600">Low Risk (&lt;40%)</strong>: Continue regular engagement</li>
            </ul>
            <p className="mt-3">
              The system provides personalized intervention recommendations for each at-risk learner,
              enabling program managers to take proactive action before learners drop out.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
