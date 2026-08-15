import { Injectable } from "@nestjs/common";
import { buildNeedProfile } from "./diagnostic-rules/build-need-profile";
import { DiagnosticDomain, NeedProfile, RawAnswers } from "./diagnostic.types";
import { CosmeticObservations } from "./vision/diagnostic-vision.provider";

@Injectable()
export class QuestionnaireService {
  buildProfile(domain: DiagnosticDomain, answers: RawAnswers): NeedProfile {
    return buildNeedProfile(domain, answers);
  }

  /**
   * Merges cosmetic observations from photo analysis into the normalized NeedProfile.
   * Rules:
   * - Explicit questionnaire answers take precedence on direct conflicts.
   * - Photo signals fill gaps or add needs that the user didn't mention.
   * - Signal provenance is recorded in `sources[need]` ("questionnaire" | "photo").
   */
  mergePhotoObservations(profile: NeedProfile, observations: CosmeticObservations): NeedProfile {
    const merged: NeedProfile = {
      ...profile,
      needs: [...profile.needs],
      sources: { ...profile.sources },
    };

    const addNeedFromPhoto = (needKey: string) => {
      if (!merged.needs.includes(needKey)) {
        merged.needs.push(needKey);
        merged.sources[needKey] = "photo";
      }
    };

    // 1. Photo observations → Needs mapping
    if (observations.shine === "high") {
      addNeedFromPhoto("brillance");
      addNeedFromPhoto("peau_grasse");
    }

    if (observations.visibleDryness === "high") {
      addNeedFromPhoto("secheresse");
      addNeedFromPhoto("peau_seche");
    }

    if (observations.visibleRedness === "high") {
      addNeedFromPhoto("rougeurs");
      addNeedFromPhoto("peau_sensible");
      if (!merged.sources["sensitivity"] || merged.sources["sensitivity"] === "photo") {
        merged.sensitivity = "high";
        merged.sources["sensitivity"] = "photo";
      }
    }

    if (observations.visibleTexture === "high") {
      addNeedFromPhoto("grain_de_peau_irregulier");
      addNeedFromPhoto("imperfections");
    }

    if (observations.visiblePores === "high") {
      addNeedFromPhoto("pores_dilates");
    }

    if (observations.unevenTone === "high") {
      addNeedFromPhoto("taches_et_eclat");
      addNeedFromPhoto("teint_terne");
    }

    // 2. Infer skinType if not already explicitly set by questionnaire
    if (!merged.skinType || merged.sources["skinType"] === "photo") {
      if (observations.shine === "high" && observations.visibleDryness === "high") {
        merged.skinType = "mixte";
        merged.sources["skinType"] = "photo";
      } else if (observations.shine === "high") {
        merged.skinType = "grasse";
        merged.sources["skinType"] = "photo";
      } else if (observations.visibleDryness === "high") {
        merged.skinType = "seche";
        merged.sources["skinType"] = "photo";
      } else if (observations.shine === "low" && observations.visibleDryness === "low") {
        merged.skinType = "normale";
        merged.sources["skinType"] = "photo";
      }
    }

    return merged;
  }
}
