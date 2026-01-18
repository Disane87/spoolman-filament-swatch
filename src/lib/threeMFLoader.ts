import * as THREE from 'three';
import JSZip from 'jszip';

/**
 * Parse 3MF model data and create Three.js geometry
 */
export async function load3MFModel(base64Data: string): Promise<THREE.BufferGeometry> {
    try {
        console.log('🔵 Starting 3MF load...');

        // Convert base64 to blob
        const response = await fetch(base64Data);
        const blob = await response.blob();
        console.log('🔵 Blob size:', blob.size);

        // Load ZIP
        const zip = await JSZip.loadAsync(blob);
        console.log('🔵 ZIP loaded, files:', Object.keys(zip.files));

        // Find 3D model file (usually 3D/3dmodel.model)
        const modelFile = zip.file('3D/3dmodel.model');
        if (!modelFile) {
            console.error('❌ No 3D model found in 3MF file');
            throw new Error('No 3D model found in 3MF file');
        }

        // Parse XML
        const xmlText = await modelFile.async('text');
        console.log('🔵 XML length:', xmlText.length);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Extract mesh data
        const meshElement = xmlDoc.getElementsByTagName('mesh')[0];
        if (!meshElement) {
            console.error('❌ No mesh found in 3MF model');
            throw new Error('No mesh found in 3MF model');
        }

        // Parse vertices
        const vertices = xmlDoc.getElementsByTagName('vertex');
        console.log('🔵 Found vertices:', vertices.length);
        const positions: number[] = [];
        const vertexMap = new Map<number, THREE.Vector3>();

        for (let i = 0; i < vertices.length; i++) {
            const vertex = vertices[i];
            const x = parseFloat(vertex.getAttribute('x') || '0');
            const y = parseFloat(vertex.getAttribute('y') || '0');
            const z = parseFloat(vertex.getAttribute('z') || '0');
            vertexMap.set(i, new THREE.Vector3(x, y, z));
        }

        // Parse triangles
        const triangles = xmlDoc.getElementsByTagName('triangle');
        console.log('🔵 Found triangles:', triangles.length);
        const indices: number[] = [];

        for (let i = 0; i < triangles.length; i++) {
            const triangle = triangles[i];
            const v1 = parseInt(triangle.getAttribute('v1') || '0');
            const v2 = parseInt(triangle.getAttribute('v2') || '0');
            const v3 = parseInt(triangle.getAttribute('v3') || '0');

            // Add vertices for this triangle
            const vertex1 = vertexMap.get(v1);
            const vertex2 = vertexMap.get(v2);
            const vertex3 = vertexMap.get(v3);

            if (vertex1 && vertex2 && vertex3) {
                const baseIndex = positions.length / 3;

                positions.push(vertex1.x, vertex1.y, vertex1.z);
                positions.push(vertex2.x, vertex2.y, vertex2.z);
                positions.push(vertex3.x, vertex3.y, vertex3.z);

                indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
            }
        }

        console.log('🔵 Total positions:', positions.length / 3, 'vertices');
        console.log('🔵 Total indices:', indices.length);

        // Create BufferGeometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        // Center geometry
        geometry.center();

        console.log('✅ Geometry created successfully');
        console.log('🔵 Bounding box:', geometry.boundingBox);

        return geometry;
    } catch (error) {
        console.error('Error loading 3MF:', error);
        throw error;
    }
}
