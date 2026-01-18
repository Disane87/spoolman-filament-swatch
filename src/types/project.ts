export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    printTime?: number; // estimated print time in seconds
    layerHeight?: number;
    slicerName?: string;
    slicerVersion?: string;
    status: 'planning' | 'in-progress' | 'completed' | 'archived';
    filamentUsage: ProjectFilament[];
    notes?: string;
    imageUrl?: string;
    modelData?: string; // Base64 encoded 3MF file for 3D viewer
    plateImages?: string[]; // Base64 encoded plate preview images
}

export interface ProjectFilament {
    id: string;
    projectId: string;
    plateIndex?: number; // Which plate this filament belongs to (0-indexed)
    filamentId?: number; // Reference to Spoolman filament (deprecated)
    spoolmanFilamentId?: string; // Reference to Spoolman filament by ID
    estimatedWeight?: number; // in grams
    estimatedLength?: number; // in mm
    actualWeight?: number; // actual used weight
    material?: string;
    color?: string;
    colorHex?: string;
    temperature?: number;
    bedTemperature?: number;
    vendor?: string;
    cost?: number; // Cost per kg (price / weight in kg)
    spoolWeight?: number; // Total weight of the spool in grams
}

export interface ProjectStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalPrintTime: number; // in seconds
    totalFilamentUsed: number; // in grams
    totalCost: number;
    projectsByMaterial: Record<string, number>;
    projectsByStatus: Record<string, number>;
}
