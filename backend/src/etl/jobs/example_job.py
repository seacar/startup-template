"""Example ETL job."""
from pyspark.sql import SparkSession, DataFrame

from src.etl.jobs.base_job import BaseETLJob


class ExampleETLJob(BaseETLJob):
    """Example ETL job implementation."""

    def extract(self) -> DataFrame:
        """Extract data from source."""
        # Add your extraction logic here
        return self.spark.createDataFrame([], schema="id INT, name STRING")

    def transform(self, data: DataFrame) -> DataFrame:
        """Transform data."""
        # Add your transformation logic here
        return data

    def load(self, data: DataFrame):
        """Load data to destination."""
        # Add your loading logic here
        pass

