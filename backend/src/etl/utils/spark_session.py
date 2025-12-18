"""Spark session configuration."""
from pyspark.sql import SparkSession
from delta import configure_spark_with_delta_pip


def create_spark_session(app_name: str = "ETL Job") -> SparkSession:
    """Create Spark session with Delta Lake support."""
    builder = SparkSession.builder.appName(app_name)

    # Configure Delta Lake
    spark = configure_spark_with_delta_pip(builder).getOrCreate()

    # Configure Spark settings
    spark.conf.set("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
    spark.conf.set(
        "spark.sql.catalog.spark_catalog",
        "org.apache.spark.sql.delta.catalog.DeltaCatalog",
    )

    return spark

