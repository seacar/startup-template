"""Base ETL job class."""
from abc import ABC, abstractmethod
from pyspark.sql import SparkSession

from src.utils.logger import logger


class BaseETLJob(ABC):
    """Base class for ETL jobs."""

    def __init__(self, spark: SparkSession):
        """Initialize ETL job."""
        self.spark = spark
        self.logger = logger

    @abstractmethod
    def extract(self):
        """Extract data from source."""
        pass

    @abstractmethod
    def transform(self, data):
        """Transform data."""
        pass

    @abstractmethod
    def load(self, data):
        """Load data to destination."""
        pass

    def run(self):
        """Run the ETL pipeline."""
        try:
            self.logger.info("Starting ETL job", job_name=self.__class__.__name__)
            data = self.extract()
            transformed_data = self.transform(data)
            self.load(transformed_data)
            self.logger.info("ETL job completed successfully", job_name=self.__class__.__name__)
        except Exception as e:
            self.logger.error("ETL job failed", job_name=self.__class__.__name__, error=str(e))
            raise

