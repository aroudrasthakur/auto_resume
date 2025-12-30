"""Vector search service using pgvector."""

from typing import List

from supabase import Client


class VectorSearchService:
    """Service for vector similarity search."""

    def __init__(self, supabase: Client):
        """Initialize service with Supabase client."""
        self.supabase = supabase

    def find_relevant_experiences(
        self, job_description_embedding: List[float], user_id: str, limit: int = 10
    ) -> List[dict]:
        """
        Find relevant experience bullets using vector similarity.

        Args:
            job_description_embedding: Job description embedding vector
            user_id: User ID to filter results
            limit: Maximum number of results

        Returns:
            List of relevant experience bullets with similarity scores
        """
        # Use raw SQL for pgvector similarity search
        query = f"""
        SELECT 
            eb.*,
            e.company,
            e.role,
            1 - (eb.embedding <=> '{job_description_embedding}'::vector) as similarity
        FROM experience_bullet eb
        JOIN experience e ON e.id = eb.experience_id
        WHERE eb.user_id = '{user_id}'
          AND eb.embedding IS NOT NULL
        ORDER BY eb.embedding <=> '{job_description_embedding}'::vector
        LIMIT {limit}
        """

        result = self.supabase.rpc("exec_sql", {"query": query}).execute()
        return result.data if result.data else []

    def find_relevant_projects(
        self, job_description_embedding: List[float], user_id: str, limit: int = 5
    ) -> List[dict]:
        """
        Find relevant project bullets using vector similarity.

        Args:
            job_description_embedding: Job description embedding vector
            user_id: User ID to filter results
            limit: Maximum number of results

        Returns:
            List of relevant project bullets with similarity scores
        """
        query = f"""
        SELECT 
            pb.*,
            p.name as project_name,
            1 - (pb.embedding <=> '{job_description_embedding}'::vector) as similarity
        FROM project_bullet pb
        JOIN project p ON p.id = pb.project_id
        WHERE pb.user_id = '{user_id}'
          AND pb.embedding IS NOT NULL
        ORDER BY pb.embedding <=> '{job_description_embedding}'::vector
        LIMIT {limit}
        """

        result = self.supabase.rpc("exec_sql", {"query": query}).execute()
        return result.data if result.data else []

    def find_similar_job_descriptions(
        self, jd_embedding: List[float], user_id: str, limit: int = 5
    ) -> List[dict]:
        """
        Find similar job descriptions.

        Args:
            jd_embedding: Job description embedding vector
            user_id: User ID to filter results
            limit: Maximum number of results

        Returns:
            List of similar job descriptions with similarity scores
        """
        query = f"""
        SELECT 
            *,
            1 - (embedding <=> '{jd_embedding}'::vector) as similarity
        FROM job_description
        WHERE user_id = '{user_id}'
          AND embedding IS NOT NULL
        ORDER BY embedding <=> '{jd_embedding}'::vector
        LIMIT {limit}
        """

        result = self.supabase.rpc("exec_sql", {"query": query}).execute()
        return result.data if result.data else []

