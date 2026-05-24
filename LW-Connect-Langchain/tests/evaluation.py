import asyncio
from typing import List, Dict
from app.models import Document, DocumentType
from app.embedding_pipeline import EmbeddingPipeline
from app.vector_store import vector_store
from app.retrieval_service import retrieval_service
import time

class EvaluationMetrics:
    """Evaluate AI assistant performance"""
    
    def __init__(self):
        self.embedding_pipeline = EmbeddingPipeline()
    
    async def evaluate_retrieval_accuracy(
        self, 
        test_queries: List[Dict[str, any]]
    ) -> Dict[str, float]:
        """
        Evaluate retrieval accuracy
        test_queries format: [{"query": "...", "expected_doc_ids": [...]}]
        """
        print("\n=== Evaluating Retrieval Accuracy ===")
        
        total = len(test_queries)
        hits_at_1 = 0
        hits_at_3 = 0
        hits_at_5 = 0
        mrr_scores = []
        
        for test in test_queries:
            query = test["query"]
            expected_ids = set(test["expected_doc_ids"])
            
            # Get query embedding
            query_embedding = await self.embedding_pipeline.embed_query(query)
            
            # Retrieve top 5
            results = await vector_store.similarity_search(
                query_embedding=query_embedding,
                top_k=5
            )
            
            retrieved_ids = [r["id"].split("_chunk_")[0] for r in results]
            
            # Calculate metrics
            if retrieved_ids and retrieved_ids[0] in expected_ids:
                hits_at_1 += 1
            
            if any(rid in expected_ids for rid in retrieved_ids[:3]):
                hits_at_3 += 1
            
            if any(rid in expected_ids for rid in retrieved_ids[:5]):
                hits_at_5 += 1
            
            # MRR (Mean Reciprocal Rank)
            for idx, rid in enumerate(retrieved_ids, 1):
                if rid in expected_ids:
                    mrr_scores.append(1.0 / idx)
                    break
            else:
                mrr_scores.append(0.0)
        
        return {
            "hits@1": hits_at_1 / total,
            "hits@3": hits_at_3 / total,
            "hits@5": hits_at_5 / total,
            "mrr": sum(mrr_scores) / len(mrr_scores)
        }
    
    async def evaluate_latency(self, queries: List[str]) -> Dict[str, float]:
        """Evaluate response latency"""
        print("\n=== Evaluating Latency ===")
        
        latencies = []
        
        for query in queries:
            start = time.time()
            
            query_embedding = await self.embedding_pipeline.embed_query(query)
            await vector_store.similarity_search(query_embedding, top_k=5)
            
            latency = time.time() - start
            latencies.append(latency)
        
        return {
            "avg_latency_ms": (sum(latencies) / len(latencies)) * 1000,
            "p50_latency_ms": sorted(latencies)[len(latencies) // 2] * 1000,
            "p95_latency_ms": sorted(latencies)[int(len(latencies) * 0.95)] * 1000,
            "max_latency_ms": max(latencies) * 1000
        }
    
    def evaluate_recommendation_relevance(
        self,
        recommendations: List[Dict],
        user_profile: Dict
    ) -> float:
        """
        Evaluate recommendation relevance based on match scores
        """
        if not recommendations:
            return 0.0
        
        # Average match score
        avg_score = sum(r.get("match_score", 0) for r in recommendations) / len(recommendations)
        
        return avg_score
    
    async def run_full_evaluation(self):
        """Run complete evaluation suite"""
        print("\n" + "=" * 50)
        print("LW-Connect AI Assistant Evaluation")
        print("=" * 50)
        
        # Sample test queries
        test_queries = [
            {
                "query": "AI governance expert",
                "expected_doc_ids": ["mentor_001"]
            },
            {
                "query": "learn about digital transformation",
                "expected_doc_ids": ["course_001"]
            }
        ]
        
        # Retrieval accuracy
        accuracy_metrics = await self.evaluate_retrieval_accuracy(test_queries)
        print("\nRetrieval Accuracy:")
        for metric, value in accuracy_metrics.items():
            print(f"  {metric}: {value:.3f}")
        
        # Latency
        sample_queries = [
            "AI governance",
            "public policy innovation",
            "digital transformation mentor",
            "learning pathway for beginners"
        ]
        
        latency_metrics = await self.evaluate_latency(sample_queries)
        print("\nLatency Metrics:")
        for metric, value in latency_metrics.items():
            print(f"  {metric}: {value:.2f}")
        
        print("\n" + "=" * 50)
        print("Evaluation Complete")
        print("=" * 50)

async def main():
    """Run evaluation"""
    # Initialize services
    await vector_store.initialize()
    
    evaluator = EvaluationMetrics()
    await evaluator.run_full_evaluation()
    
    await vector_store.close()

if __name__ == "__main__":
    asyncio.run(main())
