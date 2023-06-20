/**
 * Interface for 
 */
export interface IFS {
    /**
     * This method should ensure that the directory exists and write a file to the outputDir as specified by config.
     * @param filePath 
     * @param data 
     */
    writeFileSync(filePath: string, data: string | Buffer)
}