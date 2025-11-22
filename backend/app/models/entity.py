from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import Base


# Many-to-many association table
DocumentEntity = Table(
    "document_entities",
    Base.metadata,
    Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
    Column("entity_id", Integer, ForeignKey("entities.id"), primary_key=True),
)


class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # e.g., 'organization', 'location', 'person'

    # Relationships
    documents = relationship("Document", secondary="document_entities", back_populates="entities")
