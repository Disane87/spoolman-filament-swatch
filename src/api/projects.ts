import type { Project, ProjectFilament, ProjectStats } from '@/types/project';

const STORAGE_KEY = 'spoolman-projects';

/**
 * Get all projects from local storage
 */
export function getProjects(): Project[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        const projects = JSON.parse(data);
        return projects.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
        }));
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

/**
 * Get a single project by ID
 */
export function getProject(id: string): Project | null {
    const projects = getProjects();
    return projects.find(p => p.id === id) || null;
}

/**
 * Save a new project
 */
export function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = getProjects();

    const newProject: Project = {
        ...project,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

    return newProject;
}

/**
 * Update an existing project
 */
export function updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) return null;

    projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projects[index];
}

/**
 * Delete a project
 */
export function deleteProject(id: string): boolean {
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== id);

    if (filtered.length === projects.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

/**
 * Add filament usage to a project
 */
export function addFilamentToProject(projectId: string, filament: Omit<ProjectFilament, 'id' | 'projectId'>): ProjectFilament | null {
    const project = getProject(projectId);
    if (!project) return null;

    const newFilament: ProjectFilament = {
        ...filament,
        id: crypto.randomUUID(),
        projectId
    };

    project.filamentUsage.push(newFilament);
    updateProject(projectId, { filamentUsage: project.filamentUsage });

    return newFilament;
}

/**
 * Update filament usage in a project
 */
export function updateProjectFilament(projectId: string, filamentId: string, updates: Partial<ProjectFilament>): ProjectFilament | null {
    const project = getProject(projectId);
    if (!project) return null;

    const index = project.filamentUsage.findIndex(f => f.id === filamentId);
    if (index === -1) return null;

    project.filamentUsage[index] = {
        ...project.filamentUsage[index],
        ...updates
    };

    updateProject(projectId, { filamentUsage: project.filamentUsage });
    return project.filamentUsage[index];
}

/**
 * Remove filament from a project
 */
export function removeFilamentFromProject(projectId: string, filamentId: string): boolean {
    const project = getProject(projectId);
    if (!project) return false;

    const filtered = project.filamentUsage.filter(f => f.id !== filamentId);
    if (filtered.length === project.filamentUsage.length) return false;

    updateProject(projectId, { filamentUsage: filtered });
    return true;
}

/**
 * Calculate project statistics
 */
export function getProjectStats(): ProjectStats {
    const projects = getProjects();

    const stats: ProjectStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'in-progress').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalPrintTime: 0,
        totalFilamentUsed: 0,
        totalCost: 0,
        projectsByMaterial: {},
        projectsByStatus: {
            planning: 0,
            'in-progress': 0,
            completed: 0,
            archived: 0
        }
    };

    projects.forEach(project => {
        // Count by status
        stats.projectsByStatus[project.status]++;

        // Sum print time
        if (project.printTime) {
            stats.totalPrintTime += project.printTime;
        }

        // Sum filament usage
        project.filamentUsage.forEach(filament => {
            const weight = filament.actualWeight || filament.estimatedWeight || 0;
            stats.totalFilamentUsed += weight;

            if (filament.cost) {
                stats.totalCost += filament.cost;
            }

            if (filament.material) {
                stats.projectsByMaterial[filament.material] = (stats.projectsByMaterial[filament.material] || 0) + 1;
            }
        });
    });

    return stats;
}

/**
 * Match filament info from parsed file to Spoolman filaments
 */
export function matchFilamentToSpoolman(
    filamentInfo: { material?: string; color?: string; colorHex?: string; vendor?: string },
    spoolmanFilaments: any[]
): number | null {
    // Try exact match first
    for (const filament of spoolmanFilaments) {
        const materialMatch = !filamentInfo.material ||
            filament.material?.toLowerCase() === filamentInfo.material.toLowerCase();

        const colorMatch = !filamentInfo.colorHex ||
            filament.colorHex?.toLowerCase() === filamentInfo.colorHex.toLowerCase();

        const vendorMatch = !filamentInfo.vendor ||
            filament.vendor?.toLowerCase().includes(filamentInfo.vendor.toLowerCase());

        if (materialMatch && colorMatch && vendorMatch) {
            return filament.id;
        }
    }

    // Try partial match on color
    if (filamentInfo.colorHex) {
        for (const filament of spoolmanFilaments) {
            if (filament.colorHex?.toLowerCase() === filamentInfo.colorHex.toLowerCase()) {
                return filament.id;
            }
        }
    }

    // Try partial match on material + vendor
    if (filamentInfo.material && filamentInfo.vendor) {
        for (const filament of spoolmanFilaments) {
            const materialMatch = filament.material?.toLowerCase() === filamentInfo.material.toLowerCase();
            const vendorMatch = filament.vendor?.toLowerCase().includes(filamentInfo.vendor.toLowerCase());

            if (materialMatch && vendorMatch) {
                return filament.id;
            }
        }
    }

    return null;
}
