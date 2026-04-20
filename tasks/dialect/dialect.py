from sqlalchemy.dialects.sqlite.pysqlite import SQLiteDialect_pysqlite
from sqlalchemy.dialects import registry
import pyrqlite.dbapi2

class SQLiteDialect_pyrqlite(SQLiteDialect_pysqlite):
    driver = "pyrqlite"
    supports_statement_cache = True

    def create_connect_args(self, url):
        print("create_connect_args: url: ", url)
        """Override method to adapt SQLAlchemy connection URL to Pyrqlite."""
        return ([], {"host": url.host, "port": 8000})

    def _get_server_version_info(self, connection):
        """Override version detection for Pyrqlite."""
        return (3, 35, 0)  # Fake a compatible SQLite version

# Register the dialect
registry.register("sqlite.pyrqlite", "dialect.dialect", "SQLiteDialect_pyrqlite")
