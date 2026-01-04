import { ResumeJSON } from '../types';
import { escapeLatex } from '../utils/helpers';

/**
 * Render resume heading section
 */
function renderHeading(heading: ResumeJSON['heading']): string {
    const links = heading.links
        .map(link => `\\href{${link.url}}{\\underline{${escapeLatex(link.label)}}}`)
        .join(' $|$ ');

    return `
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(heading.name)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(heading.email)} $|$ ${links}
\\end{center}
`;
}

/**
 * Render education section
 */
function renderEducation(education: ResumeJSON['education']): string {
    if (education.length === 0) return '';

    let latex = '\\section{Education}\n\\resumeSubHeadingListStart\n';

    education.forEach(edu => {
        edu.degrees.forEach((degree, index) => {
            if (index === 0) {
                // First degree uses resumeSubheading
                latex += `  \\resumeSubheading\n`;
                latex += `    {${escapeLatex(edu.school)}}{${escapeLatex(edu.location)}}\n`;
                latex += `    {${escapeLatex(degree.degree)}`;
                if (degree.gpa) {
                    latex += ` -- GPA: ${escapeLatex(degree.gpa)}`;
                }
                latex += `}{${escapeLatex(degree.dates)}}\n`;
            } else {
                // Additional degrees use resumeSubSubheading
                latex += `  \\resumeSubSubheading\n`;
                latex += `    {${escapeLatex(degree.degree)}`;
                if (degree.gpa) {
                    latex += ` -- GPA: ${escapeLatex(degree.gpa)}`;
                }
                latex += `}{${escapeLatex(degree.dates)}}\n`;
            }
        });
    });

    latex += '\\resumeSubHeadingListEnd\n\n';
    return latex;
}

/**
 * Render experience section
 */
function renderExperience(experience: ResumeJSON['experience']): string {
    if (experience.length === 0) return '';

    let latex = '\\section{Experience}\n\\resumeSubHeadingListStart\n';

    experience.forEach(exp => {
        latex += `  \\resumeSubheading\n`;
        latex += `    {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}\n`;
        latex += `    {${escapeLatex(exp.role)}}{${escapeLatex(exp.dates)}}\n`;

        if (exp.bullets.length > 0) {
            latex += '    \\resumeItemListStart\n';
            exp.bullets.forEach(bullet => {
                latex += `      \\resumeItem{${escapeLatex(bullet.text)}}\n`;
            });
            latex += '    \\resumeItemListEnd\n';
        }
    });

    latex += '\\resumeSubHeadingListEnd\n\n';
    return latex;
}

/**
 * Render projects section
 */
function renderProjects(projects: ResumeJSON['projects']): string {
    if (projects.length === 0) return '';

    let latex = '\\section{Projects}\n\\resumeSubHeadingListStart\n';

    projects.forEach(project => {
        const projectTitle = `\\textbf{${escapeLatex(project.name)}} $|$ \\emph{${escapeLatex(project.stack)}}`;
        const projectDates = project.dates ? escapeLatex(project.dates) : '';

        latex += `  \\resumeProjectHeading\n`;
        latex += `    {${projectTitle}}{${projectDates}}\n`;

        if (project.bullets.length > 0) {
            latex += '    \\resumeItemListStart\n';
            project.bullets.forEach(bullet => {
                latex += `      \\resumeItem{${escapeLatex(bullet.text)}}\n`;
            });
            latex += '    \\resumeItemListEnd\n';
        }
    });

    latex += '\\resumeSubHeadingListEnd\n\n';
    return latex;
}

/**
 * Render skills section
 */
function renderSkills(skills: ResumeJSON['skills']): string {
    const sections = [];

    if (skills.languages?.length > 0) {
        sections.push(`\\textbf{Languages}{: ${skills.languages.map(escapeLatex).join(', ')}}`);
    }
    if (skills.frameworks?.length > 0) {
        sections.push(`\\textbf{Frameworks}{: ${skills.frameworks.map(escapeLatex).join(', ')}}`);
    }
    if (skills.tools?.length > 0) {
        sections.push(`\\textbf{Developer Tools}{: ${skills.tools.map(escapeLatex).join(', ')}}`);
    }
    if (skills.core?.length > 0) {
        sections.push(`\\textbf{Core Competencies}{: ${skills.core.map(escapeLatex).join(', ')}}`);
    }

    if (sections.length === 0) return '';

    let latex = '\\section{Technical Skills}\n';
    latex += '\\begin{itemize}[leftmargin=0.15in, label={}]\n';
    latex += '  \\small{\\item{\n';
    latex += sections.map(s => `    ${s} \\\\\n`).join('');
    latex += '  }}\n';
    latex += '\\end{itemize}\n\n';

    return latex;
}

/**
 * Render complete resume body from JSON
 */
export function renderResumeBody(resume: ResumeJSON): string {
    let body = '';

    body += renderHeading(resume.heading);
    body += renderEducation(resume.education);
    body += renderExperience(resume.experience);
    body += renderProjects(resume.projects);
    body += renderSkills(resume.skills);

    return body;
}

/**
 * Inject resume body into template
 */
export function injectIntoTemplate(body: string, templatePath: string): string {
    const fs = require('fs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    return template.replace('%% GENERATED_RESUME_BODY', body);
}
