from __future__ import annotations

from ...services.enhanced_summarizer import QualityAssuredSummarizer as _QAS, build_quality_summary_response


# Re-export with a clearer pipeline name
class OutputSummarizer(_QAS):
    pass

__all__ = ["OutputSummarizer", "build_quality_summary_response"]


